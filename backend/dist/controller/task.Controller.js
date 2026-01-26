"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTask = exports.createTask = void 0;
const type_1 = require("../types/type");
const prisma_1 = __importDefault(require("../config/prisma"));
const DEFAULT_TITLE = "Select the most clickable thumbnail";
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        //@ts-ignore
        const userId = req.userId;
        const parsedResult = type_1.createTaskInputs.safeParse(body);
        if (!parsedResult.success) {
            return res.status(411).json({
                message: "You have sent wrong inputs",
                errors: parsedResult.error.format()
            });
        }
        const parsedData = parsedResult.data;
        // parse the signature
        let response = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const response = yield tx.task.create({
                data: {
                    title: (_a = parsedData === null || parsedData === void 0 ? void 0 : parsedData.title) !== null && _a !== void 0 ? _a : DEFAULT_TITLE,
                    amount: "1",
                    signature: parsedData === null || parsedData === void 0 ? void 0 : parsedData.signature,
                    user_id: userId
                }
            });
            yield tx.option.createMany({
                data: parsedData === null || parsedData === void 0 ? void 0 : parsedData.options.map(x => ({
                    image_url: x.imageUrl,
                    task_id: response.id,
                }))
            });
            return response;
        }));
        res.json({
            id: response.id
        });
    }
    catch (error) {
    }
});
exports.createTask = createTask;
const getTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const { taskId } = req.query;
        const taskDetail = yield prisma_1.default.task.findFirst({
            where: {
                user_id: Number(userId),
                id: Number(taskId)
            },
            include: {
                options: true
            }
        });
        if (!taskDetail) {
            return res.json({
                status: false,
                message: "no task found !!"
            });
        }
        const response = yield prisma_1.default.submission.findMany({
            where: {
                task_id: Number(taskId)
            },
            include: {
                option: true
            }
        });
        const result = {};
        taskDetail.options.forEach(option => {
            result[option.id] = {
                count: 0,
                option: {
                    imageUrl: option.image_url
                }
            };
        });
        response.forEach(r => {
            result[r.option_id].count++;
        });
        return res.json({
            result
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getTask = getTask;
