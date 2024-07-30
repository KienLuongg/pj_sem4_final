import { useContext, useEffect, useState } from 'react';
import {
    Button,
    Col,
    Row,
    Form,
    Table,
    Modal,
    message,
    Select,
    Input,
} from 'antd';
import teacherApi from '../../apis/urlApi';
import {
    GradeData,
    RoomData,
    SchoolYearClassData,
    SchoolYearTeacherData,
} from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';

export default function SchoolYearClass() {
    const [schoolYearClass, setSchoolYearClass] = useState<SchoolYearClassData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [teacherSchoolYears, setTeacherSchoolYears] = useState<SchoolYearTeacherData[]>([]);
    const { idYear } = useContext(YearContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
        fetchRooms();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (idYear === null) return;
            setIsLoading(true);
            try {
                const res = await teacherApi.getSchoolYearClass(idYear);
                setSchoolYearClass(res?.data || []);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setSchoolYearClass([]);
                } else if (error instanceof Error) {
                    console.error('Failed to fetch school year classes:', error.message);
                } else {
                    console.error('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [idYear]);

    const fetchGrades = () => {
        teacherApi
            .getGrades()
            .then((response) => {
                setGrades(response.data.body);
            })
            .catch((error) => {
                console.error('Error fetching grades:', error);
            });
    };

    const fetchRooms = () => {
        teacherApi
            .getRooms()
            .then((response) => {
                setRooms(response.data.body);
            })
            .catch((error) => {
                console.error('Error fetching rooms:', error);
            });
    };

    useEffect(() => {
        const fetchTeacherSchoolYears = async () => {
            if (idYear === null) return;
            setIsLoading(true);
            try {
                const res = await teacherApi.getTeacherSchoolYear(idYear);
                setTeacherSchoolYears(res?.data);
            } catch (error) {
                console.error('Failed to fetch teachers for the school year:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacherSchoolYears();
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
            const res = await teacherApi.postCreateSchoolYearClass(formData);

            setIsModalOpen(false);
            // fetchData();
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
                            <Form.Item
                                label="Khối học"
                                name="gradeId"
                                rules={[{ required: true, message: 'Vui lòng chọn khối học!' }]}
                            >
                                <Select>
                                    {grades.map((grade) => (
                                        <Select.Option key={grade.id} value={grade.id}>
                                            {grade.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Phòng học"
                                name="roomId"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn phòng học!' },
                                ]}
                            >
                                <Select>
                                    {rooms.map((room: any) => (
                                        <Select.Option key={room.id} value={room.id}>
                                            {room.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Giáo viên"
                                name="teacherSchoolYear"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn giáo viên!' },
                                ]}
                            >
                                <Select>
                                    {teacherSchoolYears.map((t) => (
                                        <Select.Option key={t.id} value={t.id}>
                                            {t.teacher.user.userDetail.map((teacherName) => {
                                                return (
                                                    teacherName.firstname + ' ' + teacherName.lastname
                                                );
                                            })}
                                        </Select.Option>
                                    ))}
                                </Select>
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
                        <Table dataSource={schoolYearClass} rowKey="id" scroll={{ y: 450 }}
                            className="w-full">
                            <Table.Column title="STT" dataIndex="id" className="w-1" />
                            <Table.Column title="Tên lớp" dataIndex="className" />
                            <Table.Column title="Mã lớp" dataIndex="classCode" />
                            <Table.Column
                                title="Thuộc khối"
                                dataIndex="grade"
                                render={(text, record: SchoolYearClassData) =>
                                    `${record.grade.name}`
                                }
                            />
                            <Table.Column
                                title="Phòng học"
                                dataIndex="room"
                                render={(text, record: SchoolYearClassData) =>
                                    `${record.room.name}`
                                }
                            />
                            <Table.Column
                                title="Giáo viên chủ nhiệm"
                                dataIndex="teacher"
                                render={(text, record: SchoolYearClassData) =>
                                    `${record.teacherSchoolYear.teacher.sortName}`
                                }
                            />
                        </Table>
                    </Row>
                </div>
            )}
        </div>
    );
}
