import './TableQuestion.css';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { getImageUrl } from '../../constants/importImage';

const formatCell = (text) => {
    if (!text) return '';
    let formattedText = String(text);
    if (formattedText.includes('<B>')) {
        formattedText = formattedText.replaceAll('<B>', '<b>').replaceAll('</B>', '</b>');
    }
    if (formattedText.includes('</br>')) {
        formattedText = formattedText.replaceAll('</br>', '<br/>');
    }
    return formattedText;
};

const buildGrid = (options = []) => {
    let rows = 0;
    let cols = 0;
    const cells = {};

    options.forEach((option) => {
        const row = parseInt(option.id, 10);
        const col = parseInt(option.side, 10);
        if (!Number.isFinite(row) || !Number.isFinite(col) || row < 1 || col < 1) {
            return;
        }
        rows = Math.max(rows, row);
        cols = Math.max(cols, col);
        cells[`${row}:${col}`] = option;
    });

    return { rows, cols, cells };
};

const TableQuestion = ({ questionInfo }) => {
    const { rows, cols, cells } = buildGrid(questionInfo?.options);
    const img = getImageUrl(questionInfo?.img);

    return (
        <div className="table-question-wrapper">
            <ImageComponenet
                width={"220px"}
                height={"220px"}
                padding={"30px"}
                src={img}
            />
            <div className="table-question-section">
                {rows > 0 && cols > 0 ? (
                    <table className="table-question-grid">
                        <tbody>
                            {Array.from({ length: rows }, (_, rowIndex) => (
                                <tr key={rowIndex + 1}>
                                    {Array.from({ length: cols }, (_, colIndex) => {
                                        const cell = cells[`${rowIndex + 1}:${colIndex + 1}`];
                                        return (
                                            <td key={colIndex + 1}>
                                                {cell?.audio ? (
                                                    <AudioPlayer audioName={cell.audio} />
                                                ) : null}
                                                <div
                                                    className="table-question-cell"
                                                    dangerouslySetInnerHTML={{ __html: formatCell(cell?.label) }}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="table-question-empty">אין תוכן בטבלה</div>
                )}
            </div>
        </div>
    );
};

export default TableQuestion;
