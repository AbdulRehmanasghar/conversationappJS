"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const chat_gateway_1 = require("./chat.gateway");
const conversation_module_1 = require("../conversation/conversation.module");
const conversation_service_1 = require("../conversation/conversation.service");
let ChatGatewayModule = class ChatGatewayModule {
    constructor(chatGateway, conversationService) {
        this.chatGateway = chatGateway;
        this.conversationService = conversationService;
    }
    onModuleInit() {
        this.conversationService.setChatGateway(this.chatGateway);
    }
};
exports.ChatGatewayModule = ChatGatewayModule;
exports.ChatGatewayModule = ChatGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [conversation_module_1.ConversationModule],
        providers: [chat_gateway_1.ChatGateway],
        exports: [chat_gateway_1.ChatGateway],
    }),
    __metadata("design:paramtypes", [chat_gateway_1.ChatGateway,
        conversation_service_1.ConversationService])
], ChatGatewayModule);
//# sourceMappingURL=chat-gateway.module.js.map