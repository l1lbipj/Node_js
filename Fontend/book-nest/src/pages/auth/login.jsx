
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Button,
  Checkbox,
  message,
} from 'antd';

import AuthLayout from '../../components/auth/AuthLayout';
import { loginSchema } from '../../utils/authSchemas';
import './Login.css';


const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();
  
  const onSubmit = async (data) => {
  console.log('Thông tin đăng nhập:', {
    email: data.email,
    rememberMe,
  });

  // Demo Frontend: chưa xác thực với Backend
  message.success('Đăng nhập thành công! Chào mừng bạn đến với Book Nest.');

  navigate('/');
};

  return (
    
    <AuthLayout
      title="Chào mừng trở lại!" description="Đăng nhập để tiếp tục khám phá Book Nest.">
      <form
        className="auth-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Email */}
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="login-email"
                type="email"
                size="large"
                placeholder="example@email.com"
                status={errors.email ? 'error' : ''}
              />
            )}
          />

          {errors.email && (
            <span className="auth-error">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="login-password">Mật khẩu</label>

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                id="login-password"
                size="large"
                placeholder="Nhập mật khẩu"
                status={errors.password ? 'error' : ''}
              />
            )}
          />

          {errors.password && (
            <span className="auth-error">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Remember and forgot password */}
        <div className="login-options">
          <Checkbox
            checked={rememberMe}
            onChange={(event) =>
              setRememberMe(event.target.checked)
            }
          >
            Ghi nhớ đăng nhập
          </Checkbox>

          <button
            type="button"
            className="forgot-password"
            onClick={() =>
              message.info('Chức năng khôi phục mật khẩu sẽ được bổ sung sau.')
            }
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isSubmitting}
          className="auth-submit-button"
        >
          Đăng nhập
        </Button>

        {/* Register link */}
        <div className="auth-switch">
          Chưa có tài khoản?
          {' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
