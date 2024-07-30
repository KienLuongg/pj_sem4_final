import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, notification, Form } from 'antd';
import mainAxios from '../../apis/main-axios';
import { setCookie } from '../../utils/storage/cookie-storage';
import { Storage } from '../../contstants/storage';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLogin } from '../../redux/slices/isLogin-slice';
import { getLocalStorageItem, setLocalStorageItem } from '../../utils/storage/local-storage';
import { Icon } from '../../icon/icon';
// import Logo from '../images/logo';
const SignIn = () => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
   const deviceToken = getLocalStorageItem(Storage.currentToken);
   const handleLogin = async (values: any) => {
     const loginPayload = {
       ...values,
       deviceToken,
     };
    try {
      const response = await mainAxios.post('/api/v1/auth/login', loginPayload);
      console.log(response);
      setCookie(Storage.token, response?.data?.authResponse.token)
      setCookie(Storage.refresh_token, response?.data?.authResponse?.refresh_token)
      dispatch(setIsLogin(response?.data))
      setLocalStorageItem(Storage.user, JSON?.stringify(response?.data))
      navigate('/')
      notification.success({
        message: 'Đăng nhập thành công',
      })
    } catch (error) {
      notification.error({
        message: 'Đăng nhập không thành thành công',
        description: 'Tên Đăng Nhập & Mật Khẩu Không Đúng',
      })
    }
  }
  return (
    <div className="bg-white border rounded-sm border-stroke shadow-default dark:border-strokedark dark:bg-boxdark mt-27">
      <div className="flex flex-wrap items-center">
        {/* Logo */}
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            {/* <img className="hidden dark:block" src="," alt="Logo" />
            <img className="dark:hidden" src="Logo" alt="Logo" /> */}

            <p className="2xl:px-20">Cùng Trải Nghiệm Thống</p>
            <span className="inline-block mt-15">
              <Icon />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="text-2xl font-bold text-black mb-9 dark:text-white sm:text-title-xl2">
             Đăng Nhập 
            </h2>

            <Form
              form={form}
              name="normal_login"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
            >
              <div className="mb-4">
                <label htmlFor="username" className="mb-2.5 block font-medium text-black dark:text-white">
                  Tên Đăng Nhập
                </label>
                <div className="relative">
                  <Form.Item name="username" rules={[{ required: true, message: 'Không thể bỏ trống' }]}>
                    <Input
                      placeholder="Tên Đăng Nhập"
                      className="w-full py-4 pl-6 pr-10 bg-transparent border rounded-lg outline-none border-stroke focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </Form.Item>
                  <span className="absolute right-4 top-4">
                    <svg
                      className="fill-current"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* SVG path */}
                    </svg>
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="mb-2.5 block font-medium text-black dark:text-white">
                 Mật Khẩu
                </label>
                <div className="relative">
                  <Form.Item
                    name="password"
                    className="pb-3"
                    rules={[{ required: true, message: 'Không thể bỏ trống' }]}
                  >
                    <Input
                      type="passord"
                      placeholder="Mật Khẩu"
                      className="w-full py-4 pl-6 pr-10 bg-transparent border rounded-lg outline-none border-stroke focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </Form.Item>
                  {/* <input
                      onChange={handleChange}
                      type="password"
                      name="password"
                      placeholder="6+ Characters, 1 Capital letter"
                      className="w-full py-4 pl-6 pr-10 bg-transparent border rounded-lg outline-none border-stroke focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    /> */}

                  <span className="absolute right-4 top-4">
                    <svg
                      className="fill-current"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* SVG path */}
                    </svg>
                  </span>
                </div>
              </div>
              <div className="mb-5">
                <Button
                  htmlType="submit"
                  // type="submit"
                  className="w-full text-xl text-white transition border rounded-lg cursor-pointer h-14 border-primary bg-primary hover:bg-opacity-50"
                >
                 Đăng Nhập 
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p>
                 Bạn Chưa Có Tài Khoản
                  <Link to="/auth/signup" className="text-primary">
                   Đăng Kí
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn;

