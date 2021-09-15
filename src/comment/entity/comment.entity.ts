import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Answer } from '../../answer/entity/answer.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  @ApiProperty({ description: '댓글 아이디' })
  id: number;

  @Column({ type: 'text', nullable: false })
  @ApiProperty({ description: '댓글 텍스트' })
  contents: string;

  @ManyToOne(() => Answer, (answer: Answer) => answer.comments, {
    onDelete: 'CASCADE',
  })
  answer: Answer;

  @ManyToOne(() => User, (user: User) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn({ nullable: false, select: false })
  @ApiProperty({ description: '작성일' })
  created_date: Date;

  @UpdateDateColumn({ nullable: false, select: false })
  updated_date: Date;
}
