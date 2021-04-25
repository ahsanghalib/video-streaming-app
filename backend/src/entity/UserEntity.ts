import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserTypesEnum } from "../types";

@Entity("users")
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column("simple-enum", {
    nullable: false,
    default: UserTypesEnum.USER,
    enum: UserTypesEnum,
  })
  user_type: UserTypesEnum;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ nullable: false })
  created_at: string;

  @UpdateDateColumn({ nullable: false })
  updated_at: string;
}
