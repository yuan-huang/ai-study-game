from google.cloud import aiplatform

# 设置环境变量
import os
#E:\AI游戏\client_secret_677555353028-j9h8lq74e2hgffpfu3rsslpa9qfdoiif.apps.googleusercontent.com.json  
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "E:/AI游戏/client_secret_677555353028-j9h8lq74e2hgffpfu3rsslpa9qfdoiif.apps.googleusercontent.com.json" 
def predict_gemma3(project_id: str, location: str, model_name: str, prompt: str):
    """
    调用 Gemma 3 模型进行预测。

    Args:
        project_id: Google Cloud 项目 ID。
        location: 模型所在的区域（例如，"us-central1"）。
        model_name: Gemma 3 模型的名称。
        prompt:  要传递给模型的提示。
    """

    aiplatform.init(project=project_id, location=location)

    endpoint = aiplatform.Endpoint(f"projects/{project_id}/locations/{location}/endpoints/{model_name}")

    response = endpoint.predict(
        instances=[{"prompt": prompt}]
    )

    for prediction in response.predictions:
        print(prediction)

# 示例用法
project_id = "gemma-learn"  # 替换为你的 Google Cloud 项目 ID
location = "us-central1"  # 替换为 Gemma 3 所在的区域
model_name = "gemma-3-27b-it" # 替换为你的 Gemma 3 模型名称 (需要确认)
prompt = "写一个关于猫的短故事。"

predict_gemma3(project_id, location, model_name, prompt)