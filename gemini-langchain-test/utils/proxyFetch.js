import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

class ProxyFetch {
    constructor(config = {}) {
        // 从环境变量获取代理配置
        const proxyUrl = process.env.PROXY_URL;
        const proxyType = process.env.PROXY_TYPE || 'http';

        this.config = {
            proxyUrl,
            proxyType,
            timeout: parseInt(process.env.PROXY_TIMEOUT) || 30000,
            debug: process.env.PROXY_DEBUG === 'true',
            ...config
        };

        // 只有在配置了代理URL时才创建代理agent
        this.agent = this.config.proxyUrl ? this._createProxyAgent() : null;
    }

    _createProxyAgent() {
        const { proxyUrl, proxyType } = this.config;
        
        if (proxyType === 'socks5') {
            return new SocksProxyAgent(proxyUrl.startsWith('socks5://') ? proxyUrl : `socks5://${proxyUrl}`);
        } else {
            return new HttpsProxyAgent(proxyUrl.startsWith('http') ? proxyUrl : `http://${proxyUrl}`);
        }
    }

    async fetch(url, options = {}) {
        const { debug, timeout } = this.config;
        
        const fetchOptions = {
            ...options,
            // 只在有代理配置时添加agent
            ...(this.agent && { agent: this.agent }),
            timeout: timeout
        };

        if (debug) {
            console.log('请求URL:', url);
            console.log('代理设置:', this.config.proxyUrl || '未使用代理');
            console.log('请求选项:', fetchOptions);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            fetchOptions.signal = controller.signal;
            
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            if (debug) {
                console.log('响应状态:', response.status);
                console.log('响应头:', response.headers);
            }

            return response;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`请求超时 (${timeout}ms)`);
            }
            throw error;
        }
    }

    // POST请求的便捷方法
    async post(url, data, options = {}) {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        };

        return this.fetch(url, fetchOptions);
    }

    // GET请求的便捷方法
    async get(url, options = {}) {
        return this.fetch(url, { method: 'GET', ...options });
    }

    // 更新代理配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        // 只在有代理URL时更新agent
        this.agent = this.config.proxyUrl ? this._createProxyAgent() : null;
    }
}

// 导出默认实例和类
export const proxyFetch = new ProxyFetch();
export default ProxyFetch; 