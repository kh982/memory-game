import { useState, useEffect } from "react";
import Form from "./components/Form";
import MemoryCard from "./components/MemoryCard";
import AssistiveTechInfo from "./components/AssistiveTechInfo";
import GameOver from "./components/GameOver";
import ErrorCard from "./components/ErrorCard";

import Confetti from "react-confetti";

export default function App() {
  const initialFormData = { category: "animals-and-nature", number: 10 };

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [isGameOn, setIsGameOn] = useState(false);
  const [emojisData, setEmojisData] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [areAllCardsMatched, setAllCardsMatched] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (
      selectedCards.length === 2 &&
      selectedCards[0].name === selectedCards[1].name
    ) {
      setMatchedCards((prevMatchedCards) => [
        ...prevMatchedCards,
        ...selectedCards,
      ]);
    }
  }, [selectedCards]);

  useEffect(() => {
    if (emojisData.length && matchedCards.length === emojisData.length) {
      setAllCardsMatched(true);
    }
  }, [matchedCards]);

  // カテゴリごとの背景画像を定義
  const categoryBackgrounds = {
    "animals-and-nature": "url('src/assets/animals.jpg')",
    "food-and-drink": "url('src/assets/food.jpg')",
    "travel-and-places": "url('src/assets/travel.jpg')",
    // prettier-ignore
    "objects": "url('src/assets/objects.jpg')",
    // prettier-ignore
    "symbols": "url('src/assets/symbols.jpg')",
  };

  // カテゴリ変更時に背景画像を変更
  useEffect(() => {
    document.body.style.backgroundImage =
      categoryBackgrounds[formData.category] || "none";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }, [formData.category]);

  function handleFormChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  }

  async function startGame(e) {
    e.preventDefault();

    try {
      // throw new Error("I am now throwing a brand new error.");

      const response = await fetch(
        `https://emojihub.yurace.pro/api/all/category/${formData.category}`
      );

      if (!response.ok) {
        throw new Error("Could not fetch data from API");
      }

      const data = await response.json();
      const dataSlice = getDataSlice(data);
      const emojisArray = getEmojisArray(dataSlice);

      setEmojisData(emojisArray);
      setIsGameOn(true);
      setIsFirstRender(false);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setIsFirstRender(false);
    } finally {
      setIsFirstRender(false);
    }
  }

  function getDataSlice(data) {
    const randomIndices = getRandomIndices(data);
    const dataSlice = randomIndices.map((index) => data[index]);
    return dataSlice;
  }

  function getRandomIndices(data) {
    const randomIndicesArray = [];
    for (let i = 0; i < formData.number / 2; i++) {
      const randomNum = Math.floor(Math.random() * data.length);
      if (!randomIndicesArray.includes(randomNum)) {
        randomIndicesArray.push(randomNum);
      } else {
        i--;
      }
    }
    return randomIndicesArray;
  }

  function getEmojisArray(data) {
    const pairedEmojisArray = [...data, ...data];
    for (let i = pairedEmojisArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pairedEmojisArray[i];
      pairedEmojisArray[i] = pairedEmojisArray[j];
      pairedEmojisArray[j] = temp;
    }
    return pairedEmojisArray;
  }

  function turnCard(name, index) {
    if (selectedCards.length < 2) {
      setSelectedCards((prevSelectedCards) => [
        ...prevSelectedCards,
        { name, index },
      ]);
    } else if (selectedCards.length === 2) {
      setSelectedCards([{ name, index }]);
    }
  }

  function resetGame() {
    setIsGameOn(false);
    setSelectedCards([]);
    setMatchedCards([]);
    setAllCardsMatched(false);
  }
  function resetError() {
    setIsError(false);
  }

  return (
    <main>
      <h1>Memory</h1>
      {areAllCardsMatched && <Confetti recycle={false} numberOfPieces={1000} />}

      {!isGameOn && !isError && (
        <Form
          handleSubmit={startGame}
          handleChange={handleFormChange}
          isFirstRender={isFirstRender}
        />
      )}
      {isGameOn && !areAllCardsMatched && (
        <AssistiveTechInfo
          matchedCards={matchedCards}
          emojisData={emojisData}
        />
      )}
      {areAllCardsMatched && <GameOver handleClick={resetGame} />}
      {isGameOn && (
        <MemoryCard
          data={emojisData}
          handleClick={turnCard}
          selectedCards={selectedCards}
          matchedCards={matchedCards}
        />
      )}
      {isError && <ErrorCard handleClick={resetError} />}
    </main>
  );
}
