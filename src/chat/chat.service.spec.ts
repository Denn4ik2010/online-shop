import { Test } from '@nestjs/testing';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { Chat } from '@prisma/client';
import { ChatMessages, UserChat } from './types/chat.types';
import { NotFoundException } from '@nestjs/common';
import { MessageNickname } from '../message/types/message.type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatMemberValidationService } from '../chat-message/chat-member-validation.service';
import { MessageService } from '../message/message.service';

describe('ChatService', () => {
  let repository: ChatRepository;
  let service: ChatService;
  let validationService: ChatMemberValidationService;
  let messageService: MessageService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatRepository,
          useValue: {
            getUsersInChat: jest.fn(),
            findChatBetweenUsers: jest.fn(),
            getUserChats: jest.fn(),
            getChatById: jest.fn(),
            createChat: jest.fn(),
            deleteChat: jest.fn(),
            countMessagesInChat: jest.fn(),
            countUserChats: jest.fn(),
          },
        },
        {
          provide: ChatMemberValidationService,
          useValue: {
            validateChatMembers: jest.fn(),
          },
        },
        {
          provide: MessageService,
          useValue: { countMessagesInChat: jest.fn() },
        },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    service = module.get<ChatService>(ChatService);
    validationService = module.get<ChatMemberValidationService>(
      ChatMemberValidationService,
    );

    messageService = module.get<MessageService>(MessageService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Should find chat between users', () => {
    it.each<[string, Chat | null]>([
      ['Should find chat between users', { id: 1, createdAt: new Date() }],
      ['Should not find chat between users', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(repository, 'findChatBetweenUsers').mockResolvedValue(chat);
      const result = await service.findChatBetweenUsers(1, 2);
      expect(result).toEqual(chat);
    });
  });

  it("Should get user's chats", async () => {
    const userChats: UserChat[] = [
      { id: 1, withWhom: 'user2', createdAt: new Date() },
      { id: 2, withWhom: 'user1', createdAt: new Date() },
    ];

    jest.spyOn(repository, 'getUserChats').mockResolvedValue(userChats);
    jest.spyOn(repository, 'countUserChats').mockResolvedValue(2);

    const result = await service.getUserChats(1, { page: 1, pageSize: 10 });
    expect(result).toEqual({
      chats: userChats,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  describe('Sould get chat by id', () => {
    it.each<[string, ChatMessages | null]>([
      [
        'Should get chat by id',
        {
          id: 1,
          createdAt: new Date(),
          messages: [{ userId: 1 }] as MessageNickname[],
        },
      ],
      ['Should not get chat by id', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(repository, 'getChatById').mockResolvedValue(chat);
      if (chat) {
        jest
          .spyOn(validationService, 'validateChatMembers')
          .mockResolvedValue(undefined);

        jest.spyOn(messageService, 'countMessagesInChat').mockResolvedValue(10);

        const result = await service.getChatById(1, 2, {
          page: 1,
          pageSize: 10,
        });

        expect(result).toEqual({
          chat,
          nextPage: null,
          page: 1,
          pageSize: 10,
          prevPage: null,
          total: 10,
          totalPages: 1,
        });
      } else {
        jest
          .spyOn(validationService, 'validateChatMembers')
          .mockRejectedValue(new NotFoundException());

        await expect(
          service.getChatById(1, 2, { page: 1, pageSize: 10 }),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should create chat', () => {
    it.each<[string, boolean]>([
      ['Should create chat', true],
      ['Should not create chat', false],
    ])('%s', async (_, succes) => {
      if (succes) {
        jest
          .spyOn(repository, 'createChat')
          .mockResolvedValue({ id: 1 } as Chat);
        const result = await service.createChat({ sellerId: 1, buyerId: 2 });
        expect(result).toEqual({ id: 1 });
      } else {
        jest.spyOn(repository, 'createChat').mockRejectedValue(
          new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: '',
          }),
        );
        await expect(
          service.createChat({ sellerId: 1, buyerId: 2 }),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should delete chat', () => {
    it.each<[string, boolean]>([
      ['Should delete chat', true],
      ['Should not delete chat', false],
    ])('%s', async (_, success) => {
      if (success) {
        jest
          .spyOn(validationService, 'validateChatMembers')
          .mockResolvedValue(undefined);

        jest.spyOn(repository, 'deleteChat').mockResolvedValue(undefined);

        const result = await service.deleteChat(1, 1);
        expect(result).toEqual(undefined);
      } else {
        jest.spyOn(repository, 'deleteChat').mockRejectedValue(
          new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: '',
          }),
        );

        await expect(service.deleteChat(1, 1)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });
});
