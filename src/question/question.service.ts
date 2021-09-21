import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { Repository, UpdateResult } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { CreateQuestionDto } from './dto/create-question.dto';
import { throwHttpException } from '../util/error';
import { SUCCESS_RESPONSE } from '../constants/response';
import { StatusResponse } from '../types/response';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  private activateQuestionTemplate(activated): () => Promise<UpdateResult> {
    return async () => {
      const id = (
        await this.questionRepository.findOne({
          where: { activated },
          select: ['id'],
          ...(activated ? { order: { id: 'DESC' } } : {}),
        })
      )?.id;
      const activated_date = moment().format('YYYY-MM-DD');
      return await this.questionRepository.update(id, {
        activated: !activated,
        activated_date,
      });
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
  async updateTodayQuestion() {
    setTimeout(async () => {
      await Promise.all([
        this.activateQuestionTemplate(true),
        this.activateQuestionTemplate(false),
      ]);
      console.log(
        `[${moment().format('YYYY-MM-DD HH:MM:SS')}] Question updated...`,
      );
    }, 1000);
  }

  async findQuestionById(id: string): Promise<Question> {
    return await this.questionRepository.findOne({ id });
  }

  async findQuestion(activated_date): Promise<Question> {
    return await this.questionRepository.findOne({
      activated_date,
      activated: true,
    });
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<StatusResponse> {
    try {
      const newQuestion = await this.questionRepository.create(
        createQuestionDto,
      );
      await this.questionRepository.save(newQuestion);
    } catch (err) {
      throwHttpException(err, HttpStatus.CONFLICT);
    }
    return SUCCESS_RESPONSE;
  }
}
