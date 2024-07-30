import { useContext, useEffect, useState } from 'react';
import { Button, Col, Row, Form, Table, Modal, message, Select } from 'antd';
import teacherApi from '../../apis/urlApi';
import {
    SchoolYearTeacherData,
    SchoolYearsData,
    TeacherData,
} from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';

export default function SchoolYearTeacher() {
    const [schoolYearTeachers, setSchoolYearTeachers] = useState<SchoolYearTeacherData[]>([]);
    const [teachers, setTeachers] = useState<TeacherData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [schoolYears, setSchoolYears] = useState<SchoolYearsData[]>([]);

    useEffect(() => {
        fetchSchoolYears();
        fetchTeachers();
    }, []);

    const { idYear } = useContext(YearContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (idYear === null) return;
            setIsLoading(true);
            try {
                const res = await teacherApi.getTeacherSchoolYear(idYear);
                setSchoolYearTeachers(res.data);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setSchoolYearTeachers([]);
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

    const fetchSchoolYears = () => {
        teacherApi
            .getSchoolYear()
            .then((response) => {
                setSchoolYears(response.data);
                console.log(response.data);
            })

            .catch((error) => {
                console.error('Error fetching school years:', error);
            });
    };

    const fetchTeachers = () => {
        teacherApi
            .getTeacher()
            .then((response) => {
                setTeachers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching teachers:', error);
            });
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const formData = await form.validateFields();
            formData['schoolYearId'] = idYear;
            const res = await teacherApi.postCreateTeacherSchoolYear(formData);
            setIsLoading(!isLoading);
            setIsModalOpen(false);
            message.success('Data submitted successfully!');
        } catch (error: any) {
            if (error.response) console.error('Server Error:', error.response.data);
            else if (error.request) console.error('Network Error:', error.request);
            else console.error('Error:', error.message);
            message.error('Failed to submit data. Please try again later.');
        }
    };

    const renderJoiningDate = (text: any, record: SchoolYearTeacherData) => {
        const date = new Date(record.teacher.joiningDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderBirthday = (birthday: string) => {
        const date = new Date(birthday);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderGender = (gender: boolean) => {
        return gender ? 'Female' : 'Male';
    };

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Row className="mb-4">
                <Col span={12}></Col>
                <Col span={12} className="text-right">
                    <Button type="default" onClick={showModal} className="">
                        Thêm
                    </Button>
                    <Modal
                        title="Thêm năm học"
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
                            style={{ maxWidth: 600 }}
                        >
                            <Form.Item
                                label="Giáo viên"
                                name="teacherIds"
                                rules={[
                                    { required: true, message: 'Please select at least one teacher!' },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select teachers"
                                >
                                    {teachers.map((teacher) => (
                                        <Select.Option key={teacher.id} value={teacher.id}>
                                            {teacher.sortName}
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
                <Table
                    dataSource={schoolYearTeachers}
                    rowKey="id"
                    scroll={{ y: 450 }}
                    className="text-black dark:text-white"
                >
                    <Table.Column
                        title="STT"
                        render={(text, record, index) => index + 1}
                        className="w-1/12"
                    />
                    <Table.Column title="Số hiệu cán bộ"
                        render={(text, record: SchoolYearTeacherData) =>
                            `${record.teacher.officerNumber}`} />
                    <Table.Column title="Giáo viên"
                        render={(text, record: SchoolYearTeacherData) =>
                            record.teacher.user.userDetail.map((teacherDetail, index) => (
                                <div key={index}>
                                    <b>{teacherDetail.firstname} {teacherDetail.lastname}</b>
                                </div>
                            ))} />
                    <Table.Column title="Giới tính"
                        render={(text, record: SchoolYearTeacherData) =>
                            record.teacher.user.userDetail.map((teacherDetail, index) => (
                                <div key={index}>
                                    {renderGender(teacherDetail.gender)}
                                </div>
                            ))} />
                    <Table.Column title="Ngày sinh"
                        render={(text, record: SchoolYearTeacherData) =>
                            record.teacher.user.userDetail.map((teacherDetail, index) => (
                                <div key={index}>
                                    {renderBirthday(teacherDetail.birthday)}
                                </div>
                            ))} />
                    <Table.Column title="Ngày gia nhập" render={renderJoiningDate} />
                </Table>
            )}
        </div>
    );
}
