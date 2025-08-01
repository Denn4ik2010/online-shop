import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { Message } from '@prisma/client';
import { MessageNickname } from './types/message.type';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMessageById(messageId: number) {
    return await this.prisma.message.findUnique({ where: { id: messageId } });
  }

  async createMessage(
    createDto: CreateMessageDto,
    chatId: number,
    userId: number,
  ): Promise<MessageNickname> {
    return await this.prisma.message.create({
      data: {
        text: createDto.text,
        chatId: chatId,
        userId: userId,
      },

      include: { user: { select: { nickname: true } } },
    });
  }

  async deleteMessage(messageId: number): Promise<Message> {
    return await this.prisma.message.delete({ where: { id: messageId } });
  }

  async updateMessage(
    messageId: number,
    updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    return await this.prisma.message.update({
      where: { id: messageId },
      data: { text: updateDto.text },

      include: { user: { select: { nickname: true } } },
    });
  }

  async getMessagesByChatId(
    chatId: number,
    skip: number,
    take: number,
  ): Promise<MessageNickname[]> {
    return await this.prisma.message.findMany({
      where: { chatId },
      include: { user: { select: { nickname: true } } },
      skip,
      take,
    });
  }

  async countMessagesInChat(chatId: number): Promise<number> {
    return await this.prisma.message.count({
      where: { chatId },
    });
  }
}
