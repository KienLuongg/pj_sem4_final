
import ChartThree from '../../components/ChartThree.tsx';
import ChartTwo from '../../components/ChartTwo.tsx';
import ChatCard from '../../components/ChatCard.tsx';

const ECommerce = () => {
  return (
    <div className='p-4 md:p-6 2xl:p-10'>
      <div className="mt-4 grid grid-cols-12 gap-4 ">
        <ChartTwo />
        <ChartThree />
        <ChatCard />
      </div>
    </div>
  );
};

export default ECommerce;
