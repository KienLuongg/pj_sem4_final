import { Button, Form, Input, Modal, DatePicker, message, Select } from 'antd';
import React, { useState, useContext } from 'react';
import { YearContext } from '../../context/YearProvider/YearProvider';
import { useNavigate } from 'react-router-dom';
import mainAxios from '../../apis/main-axios';

const { Option } = Select;

const NoTimetable: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { idYear } = useContext(YearContext);
    const navigate = useNavigate();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const postData = {
                title: values.className,
                schoolYearId: idYear,
                releaseAt: values.releaseAt.format(),
                sem: values.sem,
            };
            await mainAxios.post('/api/v1/schedule/create-calendar-release', postData);
            message.success('Thời khóa biểu đã được tạo thành công');
            setIsModalOpen(false);
            navigate('/create-schedule');
        } catch (error) {
            console.error('Failed to submit form:', error);
            message.error('Có lỗi xảy ra khi tạo thời khóa biểu');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
            <div className="mb-5">
                <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m4 0h-4v4h4zM12 8h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"></path>
                </svg>
            </div>
            <p className="text-lg mb-5">Chưa có thời khóa biểu nào</p>
            <Button
                type="default"
                className="text-meta-9 bg-form-input"
                onClick={showModal}
            >
                Lập thời khoá biểu
            </Button>
            <Modal
                title="Tạo đợt áp dụng thời khoá biểu"
                visible={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit}>
                        Xác nhận
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                >
                    <Form.Item
                        label="Tên thời khoá biểu"
                        name="className"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên thời khoá biểu!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Ngày áp dụng"
                        name="releaseAt"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng!' }]}
                    >
                        <DatePicker className='w-full' showTime />
                    </Form.Item>
                    <Form.Item
                        label="Học kỳ"
                        name="sem"
                        rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
                    >
                        <Select>
                            <Option value="HOC_KI_1">Học Kỳ 1</Option>
                            <Option value="HOC_KI_2">Học Kỳ 2</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NoTimetable;
