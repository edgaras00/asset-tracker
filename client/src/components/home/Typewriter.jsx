import React, {useState, useEffect} from "react"; 

const Typewriter = ({inputText, typingSpeed}) => {
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [text, setText] = useState("");

    useEffect(() => {
        const currentText = inputText[textIndex];

        if (charIndex < currentText.length) {
            const newChar = currentText.charAt(charIndex);
            setText(prevText => prevText + newChar);
            setCharIndex(prevIndex => prevIndex + 1);
        } else {
            if (textIndex < inputText.length - 1) {
                const currentText = text[textIndex];
                setText(prevText => prevText.slice(0,currentText.length - 1))

                setTimeout(() => {
                    setTextIndex(prevIndex => prevIndex + 1);
                    setCharIndex(0);
                }, typingSpeed);
            }
        }
    }, [charIndex, textIndex, inputText, typingSpeed]);

    useEffect(() => {
        if (textIndex === 0 && charIndex === 0) {
            const initialTyping = setTimeout(() => {
                setCharIndex(1);
            }, typingSpeed);
            return () => clearTimeout(initialTyping);
        }
    }, [textIndex, charIndex, typingSpeed]);

    return (
        <div>
            <p>{text}</p>
        </div>
    )
}

export default Typewriter