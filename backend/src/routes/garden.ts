import { Router } from 'express';
import { GardenController } from '../controllers/GardenController';

const router = Router();
const gardenController = new GardenController();

/**
 * @route POST /api/garden/plant
 * @desc 种植花朵到花园
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @body position - 种植位置 {x: number, y: number}
 * @access Public
 */
router.post('/plant', gardenController.plantFlower.bind(gardenController));

/**
 * @route POST /api/garden/harvest
 * @desc 收获花朵（从花园移回仓库）
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @access Public
 */
router.post('/harvest', gardenController.harvestFlower.bind(gardenController));

/**
 * @route POST /api/garden/move
 * @desc 移动花朵在花园中的位置
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @body newPosition - 新位置 {x: number, y: number}
 * @access Public
 */
router.post('/move', gardenController.moveFlower.bind(gardenController));

/**
 * @route POST /api/garden/heal
 * @desc 使用甘露治疗花朵
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @body nectarSubject - 甘露学科
 * @body nectarGrade - 甘露年级
 * @body nectarCategory - 甘露分类
 * @body healingAmount - 治疗量
 * @access Public
 */
router.post('/heal', gardenController.healFlower.bind(gardenController));

/**
 * @route GET /api/garden/layout/:userId
 * @desc 获取花园布局（已种植的花朵）
 * @param userId - 用户ID
 * @access Public
 */
router.get('/layout/:userId', gardenController.getGardenLayout.bind(gardenController));

/**
 * @route GET /api/garden/warehouse/flowers/:userId
 * @desc 获取仓库中未种植的花朵
 * @param userId - 用户ID
 * @access Public
 */
router.get('/warehouse/flowers/:userId', gardenController.getWarehouseFlowers.bind(gardenController));

/**
 * @route GET /api/garden/warehouse/items/:userId
 * @desc 获取花园仓库道具（花朵和甘露）
 * @param userId - 用户ID
 * @access Public
 */
router.get('/warehouse/items/:userId', gardenController.getGardenWarehouseItems.bind(gardenController));

/**
 * @route POST /api/garden/batch-plant
 * @desc 批量种植花朵
 * @body flowers - 花朵数据数组 [{userId, flowerId, position}, ...]
 * @access Public
 */
router.post('/batch-plant', gardenController.batchPlantFlowers.bind(gardenController));

/**
 * @route POST /api/garden/auto-plant
 * @desc 自动种植花朵（系统自动选择位置）
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @access Public
 */
router.post('/auto-plant', gardenController.autoPlantFlower.bind(gardenController));

/**
 * @route GET /api/garden/memory/:userId
 * @desc 获取花园中所有花朵（应用遗忘曲线计算实时HP）
 * @param userId - 用户ID
 * @access Public
 */
router.get('/memory/:userId', gardenController.getGardenFlowersWithMemory.bind(gardenController));

/**
 * @route GET /api/garden/forget-curve/:userId/:flowerId
 * @desc 获取单朵花的遗忘曲线数据
 * @param userId - 用户ID
 * @param flowerId - 花朵ID
 * @query durationHours - 预测时长（小时，默认168小时即7天）
 * @access Public
 */
router.get('/forget-curve/:userId/:flowerId', gardenController.getFlowerForgetCurve.bind(gardenController));

/**
 * @route GET /api/garden/subject-status/:userId
 * @desc 获取各学科花朵状态信息（等级、HP、闯关记录等）
 * @param userId - 用户ID
 * @access Public
 */
router.get('/subject-status/:userId', gardenController.getSubjectFlowerStatus.bind(gardenController));

/**
 * @route GET /api/garden/nectar/:userId
 * @desc 获取用户的甘露库存
 * @param userId - 用户ID
 * @access Public
 */
router.get('/nectar/:userId', gardenController.getNectarInventory.bind(gardenController));

/**
 * @route POST /api/garden/use-nectar
 * @desc 使用甘露治疗花朵
 * @body userId - 用户ID
 * @body flowerId - 花朵ID
 * @body nectarId - 甘露ID
 * @body healingAmount - 治疗量（可选，默认使用甘露的全部治疗力）
 * @access Public
 */
router.post('/use-nectar', gardenController.useNectar.bind(gardenController));

export default router; 