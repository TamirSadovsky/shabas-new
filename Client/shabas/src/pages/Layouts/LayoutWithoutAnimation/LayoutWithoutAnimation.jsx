import AudioPlayer from '../../../componenets/AudioPlayer/AudioPlayer';
// import './LayoutWrapper.css';

const LayoutWithoutAnimation = ({ children, title, subTitle }) => {
    return (
        <div className='page'>
            <header>
                <div className='question_header'>
                    <div className='question_subtitle'>{subTitle}</div>
                    <div className='question_title_wrapper'>
                        <div className='question_title'>{title}</div>
                        <AudioPlayer />
                    </div>
                </div>
            </header>
            <div className='question_section'>
                <div className='question_wrapper'>
                    {explanation}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LayoutWithoutAnimation;
