import { useContext, useEffect, useState } from 'react';
import {
    Button,
    Col,
    Row,
    Form,
    Table,
    Modal,
    message,
    Input,
} from 'antd';
import moment from 'moment';
import teacherApi from '../../apis/urlApi';
import { CalendarRelease } from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';
import mainAxios from '../../apis/main-axios';

export default function SchoolYearClass() {
    const [calendar, setCalendar] = useState<CalendarRelease[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { idYear } = useContext(YearContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (idYear === null) return;
            setIsLoading(true);
            try {
                const res = await mainAxios.get(`/api/v1/schedule/get-calendar-release?schoolYearId=${idYear}`);
                setCalendar(res?.data || []);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 2000) {
                    setCalendar([]);
                } else {
                    console.error('Failed to fetch school year classes:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [idYear]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const formData = await form.validateFields();

            formData['schoolYear'] = idYear;
             await teacherApi.postCreateSchoolYearClass(formData);

            setIsModalOpen(false);
            message.success('Data submitted successfully!');
        } catch (error: any) {
            if (error.response) {
                console.error('Server Error:', error.response.data);
            } else if (error.request) {
                console.error('Network Error:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            message.error('Failed to submit data. Please try again later.');
        }
    };

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Row className="mb-6">
                <Col>
                    <Button type="default" onClick={showModal}>
                        Thêm
                    </Button>
                </Col>
                <Col>
                    <Modal
                        title="Thêm lớp"
                        visible={isModalOpen}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                Hủy
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleSubmit}>
                                Gửi
                            </Button>,
                        ]}
                    >
                        <Form
                            form={form}
                            name="addSchoolYearTeacherForm"
                            labelCol={{ flex: '110px' }}
                            labelAlign="left"
                            labelWrap
                            wrapperCol={{ flex: 1 }}
                            colon={false}
                        >
                            <Form.Item
                                label="Tên lớp"
                                name="className"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn giáo viên!' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Mã lớp"
                                name="classCode"
                                rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    <Row justify="space-between" className="mb-6">
                        <Table dataSource={calendar} rowKey="id" scroll={{ y: 450 }}
                            className="w-full" locale={{ emptyText: 'No data available' }}>
                            <Table.Column title="Tên" dataIndex="title" />
                            <Table.Column
                                title="Ngày lập"
                                dataIndex="releaseAt"
                                render={(text: string) => moment(text).format('DD/MM/YYYY')}
                            />
                        </Table>
                    </Row>
                </div>
            )}
        </div>
    );
}
