
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Button,
  Checkbox,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import AuthLayout from '../../components/auth/AuthLayout';
import { registerSchema } from '../../utils/authSchemas';

import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (data) => {
    // Frontend demo: chưa gửi dữ liệu đến Backend.
    console.log('Thông tin đăng ký:', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: 'reader',
    });

    message.success(
      'Dữ liệu hợp lệ! Chức năng đăng ký sẽ được kết nối sau.'
    );

    // Tạm thời chuyển về trang đăng nhập.
    navigate('/login');
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      description="Tham gia cộng đồng yêu sách cùng Book Nest"
    >
      <form
        className="auth-form register-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="register-welcome">
          <span className="register-welcome-icon">
            <BookOutlined />
          </span>

          <div>
            <strong>Chào mừng đến với Book Nest!</strong>
            <p>Tạo tài khoản miễn phí để bắt đầu khám phá.</p>
          </div>
        </div>

        {/* Họ và tên */}
        <div className="form-field">
          <label>Họ và tên</label>

          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                prefix={<UserOutlined />}
                placeholder="Nhập họ và tên"
                status={errors.fullName ? 'error' : ''}
              />
            )}
          />

          {errors.fullName && (
            <span className="field-error">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-field">
          <label>Địa chỉ email</label>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                prefix={<MailOutlined />}
                placeholder="example@email.com"
                status={errors.email ? 'error' : ''}
              />
            )}
          />

          {errors.email && (
            <span className="field-error">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="form-field">
          <label>Mật khẩu</label>

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                size="large"
                prefix={<LockOutlined />}
                placeholder="Tối thiểu 8 ký tự"
                status={errors.password ? 'error' : ''}
              />
            )}
          />

          {errors.password && (
            <span className="field-error">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="form-field">
          <label>Xác nhận mật khẩu</label>

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                size="large"
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
                status={errors.confirmPassword ? 'error' : ''}
              />
            )}
          />

          {errors.confirmPassword && (
            <span className="field-error">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Điều khoản */}
        <div className="register-terms">
          <Controller
            name="agreeTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(event) =>
                  field.onChange(event.target.checked)
                }
              >
                Tôi đồng ý với{' '}
                <Link to="/terms">Điều khoản sử dụng</Link>
                {' '}và{' '}
                <Link to="/privacy">Chính sách bảo mật</Link>.
              </Checkbox>
            )}
          />

          {errors.agreeTerms && (
            <span className="field-error">
              {errors.agreeTerms.message}
            </span>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isSubmitting}
          icon={<CheckCircleOutlined />}
          className="register-submit"
        >
          Tạo tài khoản
        </Button>

        <Divider plain>Hoặc</Divider>

        <p className="auth-switch-text">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
