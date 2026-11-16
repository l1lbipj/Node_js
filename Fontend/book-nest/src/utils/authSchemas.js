
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),

  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được vượt quá 100 ký tự'),

    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ'),

    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),

    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu'),

    agreeTerms: z
      .boolean()
      .refine(
        (value) => value === true,
        { message: 'Bạn cần đồng ý với điều khoản sử dụng' }
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirmPassword'],
    }
  );
