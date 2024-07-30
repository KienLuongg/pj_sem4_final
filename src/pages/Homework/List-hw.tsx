import { useContext, useEffect, useState } from 'react';
import {
    Button,
    Col,
    Row,
    Form,
    Table,
    Modal,
    Input,
    DatePicker,
    Upload,
    Select
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import TextArea from 'antd/es/input/TextArea';
import teacherApi from '../../apis/urlApi';
import type { UploadFile } from 'antd/es/upload/interface';
import type { HomeworkResponse, HomeworkTeacher } from 'types/response';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';

const { Dragger } = Upload;
const { Option } = Select;

export default function ListHomeworks() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { idYear } = useContext(YearContext);
    const [teacherClassSubject, setTeacherClassSubject] = useState<HomeworkTeacher[]>([]);
    const [homework, setHomework] = useState<HomeworkResponse['body']>([]);
    const [selectedTeacherSchoolYearClassSubjectId, setSelectedTeacherSchoolYearClassSubjectId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        const fetchTeacherClassSubject = async () => {
            if (idYear === null) return;
            setIsLoading(true);
            try {
                const res = await teacherApi.getHomeworkTeacher(idYear);
                setTeacherClassSubject(res?.data || []);
                setSelectedTeacherSchoolYearClassSubjectId(null); // Reset selection when year changes
                setHomework([]); // Clear homework data when year changes
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setTeacherClassSubject([]);
                    setSelectedTeacherSchoolYearClassSubjectId(null); // Reset selection when year changes
                    setHomework([]);
                } else {
                    console.error('Failed to fetch teacher class subjects:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacherClassSubject();
    }, [idYear]);

    const fetchHomework = async (teacherSchoolYearClassSubjectId: number) => {
        setIsLoading(true);
        try {
            const res = await teacherApi.getHomework(teacherSchoolYearClassSubjectId);
            setHomework(res?.data.body || []);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setHomework([]);
            } else {
                console.error('Failed to fetch homework:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTeacherSchoolYearClassSubjectId !== null) {
            fetchHomework(selectedTeacherSchoolYearClassSubjectId);
        } else {
            setHomework([]); // Clear homework if no subject is selected
        }
    }, [selectedTeacherSchoolYearClassSubjectId]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('content', values.content);
            formData.append('startDate', values.startDate.format('YYYY-MM-DD'));
            formData.append('dueDate', values.dueDate.format('YYYY-MM-DD'));
            formData.append('teacherSchoolYearClassSubjectId', values.teacherSchoolYearClassSubjectId);

            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            await teacherApi.postCreateHomework(formData);
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);

            if (selectedTeacherSchoolYearClassSubjectId !== null) {
                fetchHomework(selectedTeacherSchoolYearClassSubjectId);
            }
        } catch (error) {
            console.error('Failed to create homework:', error);
        }
    };

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    };

    const handleSelectChange = (value: number) => {
        setSelectedTeacherSchoolYearClassSubjectId(value);
    };

    const columns = [
        {
            title: 'Tên bài tập',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, record: any) => (
                <Link to={`/homework-details/${record.id}`}>{title}</Link>
            ),
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'File bài tập',
            dataIndex: 'homeworkImageUrls',
            key: 'homeworkImageUrls',
            render: (homeworkImageUrls: string[]) => (
                <ul>
                    {homeworkImageUrls && homeworkImageUrls.length > 0 ? (
                        homeworkImageUrls.map((url, index) => (
                            <li key={index} className='mb-4'>
                                <a className='text-primary' href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                            </li>
                        ))
                    ) : (
                        <li>Không có tệp tin</li>
                    )}
                </ul>
            ),
        },
        {
            title: 'Hạn nộp',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (text: string) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Số lượng bài đã nộp',
            dataIndex: 'studentSubmission',
            key: 'studentSubmission',
        },
        // Add more columns as needed
    ];

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Row className="mb-6">
                <Col>
                    <Select
                        placeholder=""
                        onChange={handleSelectChange}
                        value={selectedTeacherSchoolYearClassSubjectId} // Set value of the Select
                        className='w-40'
                    >
                        {teacherClassSubject.map((teacherSubject) => (
                            <Option key={teacherSubject.teacherSchoolYearClassSubject} value={teacherSubject.teacherSchoolYearClassSubject}>
                                {teacherSubject.schoolYearClass.className} - {teacherSubject.schoolYearSubject.subject.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col className='ml-5'>
                    <Button type="default" onClick={showModal}>
                        Giao bài tập
                    </Button>
                </Col>
            </Row>
            <Modal
                title="Giao bài tập"
                visible={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Huỷ
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit}>
                        Xác nhận
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    name="addHomework"
                    labelCol={{ flex: '110px' }}
                    labelAlign="left"
                    labelWrap
                    wrapperCol={{ flex: 1 }}
                    colon={false}
                    className='mt-5'
                >
                    <Form.Item
                        label="Tên bài tập"
                        name="title"
                        rules={[{ required: true, message: 'Điền tên bài tập!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Điền ngày bắt đầu!' }]}
                    >
                        <DatePicker className='w-full' />
                    </Form.Item>
                    <Form.Item
                        label="Hạn nộp bài"
                        name="dueDate"
                        rules={[{ required: true, message: 'Điền hạn nộp!' }]}
                    >
                        <DatePicker className='w-full' />
                    </Form.Item>
                    <Form.Item
                        label="Phân công"
                        name="teacherSchoolYearClassSubjectId"
                        rules={[{ required: true, message: 'Chọn giáo viên!' }]}
                    >
                        <Select>
                            {teacherClassSubject.map((teacherSubject) => (
                                <Option key={teacherSubject.teacherSchoolYearClassSubject} value={teacherSubject.teacherSchoolYearClassSubject}>
                                    {teacherSubject.schoolYearClass.className} - {teacherSubject.schoolYearSubject.subject.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: 'Điền nội dung!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        label="Tệp tin"
                        name="images"
                    // rules={[{ required: true, message: 'Tải lên ít nhất một hình ảnh!' }]}
                    >
                        <Dragger
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}  // Prevent automatic upload
                            multiple
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo và thả tệp tin vào đây hoặc nhấn để chọn</p>
                        </Dragger>
                    </Form.Item>
                </Form>
            </Modal>
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    <Row justify="space-between" className="mb-6">
                        <Table
                            columns={columns}
                            dataSource={homework}
                            rowKey="id"
                            scroll={{ y: 450 }}
                            className="w-full"
                        />
                    </Row>
                </div>
            )}
        </div>
    );
}
