import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout, Menu, Table, Image } from 'antd';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import teacherApi from '../../apis/urlApi';
import Loader from '../../common/Loader';
import { HomeworkDetailsResponse } from 'types/response';
import moment from 'moment';

const { Sider, Content } = Layout;

function HomeworkDetails() {
    const { HomeworkId } = useParams<{ HomeworkId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [hwDetails, setHwDetails] = useState<HomeworkDetailsResponse | undefined>();
    const [studentNames, setStudentNames] = useState<string[]>([]);
    const [selectedStudentIndex, setSelectedStudentIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchHomeworkDetails = async () => {
            setIsLoading(true);
            try {
                const res = await teacherApi.getHomeworkDetails(Number(HomeworkId));
                setHwDetails(res?.data);
                if (res?.data?.studentYearHomeWorks) {
                    const names = res.data.studentYearHomeWorks.map((student: any) => student.studentYearInfoId.fullName);
                    setStudentNames(names);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setHwDetails(undefined);
                } else {
                    console.error('Failed to fetch homework details:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeworkDetails();
    }, [HomeworkId]);

    const handleStudentSelect = (index: number) => {
        setSelectedStudentIndex(index);
    };

    const studentYearWorkDetails = selectedStudentIndex !== null && hwDetails?.studentYearHomeWorks[selectedStudentIndex];

    const columns = [
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        { title: 'Thời gian nộp bài', dataIndex: 'submitTime', key: 'submitTime', render: (submitTime: string) => moment(submitTime).format('MMMM Do YYYY, h:mm:ss a') },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={260} className="site-layout-background">
                <Menu mode="inline" className='h-full flex flex-col items-start'>
                    <Link to="/homework" className='text-meta-5 flex items-center w-full mt-6 pl-6 mb-6'>
                        <FaArrowLeft className='mr-2' />
                        <h2>Quay lại</h2>
                    </Link>
                    <div className='pb-5 pt-6 mb-2 w-full bg-bodydark'>
                        <h3 className="ml-10 text-lg font-semibold">Bài nộp của học sinh</h3>
                    </div>
                    {studentNames.map((name, index) => (
                        <Menu.Item key={index} onClick={() => handleStudentSelect(index)}>
                            {`${name} - ${hwDetails?.studentYearHomeWorks[index]?.studentYearInfoId.studentCode}`}
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>
            <Layout>
                <Content className='pl-3 pt-3 pr-3'>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <Fragment>
                            {studentYearWorkDetails && (
                                <Fragment>
                                    <Table
                                        columns={columns}
                                        dataSource={[studentYearWorkDetails]}
                                        rowKey="id"
                                        pagination={false}
                                    />
                                    {studentYearWorkDetails.imageUrl && (
                                        <div className="mt-4">
                                            {studentYearWorkDetails.imageUrl.map((url, index) => (
                                                <Image key={index} src={url} width={'100%'} className="mb-3" />
                                            ))}
                                        </div>
                                    )}
                                </Fragment>
                            )}
                        </Fragment>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default HomeworkDetails;
