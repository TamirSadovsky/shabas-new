import gmar from '../../assets/gmar_icon.svg'
import CategoryButton from '../CategoryButton/CategoryButton'


function FinalWorkButton( {onClick} ) {

    const handleText = () =>{
        return(
            <>
                <img src={gmar} className='gmar_icon'/>
                 עבודת גמר
            </>
        )
    }

    return (
        <>  
            <CategoryButton 
                buttonText={handleText()} 
                className={'category_button gmar'}
                onClick={onClick}
            >    
            </CategoryButton>
        </>
    )
}

export default FinalWorkButton
