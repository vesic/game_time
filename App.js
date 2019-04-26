import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  AsyncStorage
} from "react-native";

const API_URL = "https://deckofcardsapi.com/api/deck/new/shuffle";
const FALLBACK_URL = "https://via.placeholder.com/226x314";
const UP = "UP";
const DOWN = "DOWN";
const WON = "You won!";
const LOSE = "You lose!";
const DRAW = "Same value!";
const CONTINUE = "Continue";
const NEW_DECK = "New Deck";
const EMPTY = "";
const LOADING = "Loading...";
const YOUR_GUESS = "Your guess?";
const HEADER = "Card Game";
const DECK_ID = "DECK_ID";

const rankings = {
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  ACE: 14
};

// helpers
const request = async url => {
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

const log = data => JSON.stringify(data);

const noop = () => {};

const returnInt = value => (rankings[value] ? rankings[value] : value);

class App extends Component {
  state = {
    deck_id: 0,
    selectedURL: EMPTY
  };

  async componentDidMount() {
    let url;
    const deckId = await this.retrieveDeckId();

    if (deckId !== null) {
      url = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle`;
    } else {
      url = API_URL;
    }

    this.newGame(url);
  }

  showMessage = (title, newCard) => {
    Alert.alert(
      title,
      `New card - ${newCard.value} ${newCard.suit}`,
      [
        { text: CONTINUE, onPress: noop },
        {
          text: NEW_DECK,
          onPress: () => {
            this.clearStorage();
            this.newGame(API_URL);
          }
        }
      ],
      { cancelable: false }
    );
  };

  placeBet = async (userGuess) => {
    const { deck_id, selectedCard } = this.state;

    try {
      let response = await request(
        `https://deckofcardsapi.com/api/deck/${deck_id}/draw`
      );
      const oldCard = selectedCard.cards[0];
      const newCard = response.cards[0];

      if (userGuess === UP) {
        if (returnInt(newCard.value) > returnInt(oldCard.value)) {
          this.showMessage(WON, newCard);
        } else if (returnInt(newCard.value) < returnInt(oldCard.value)) {
          this.showMessage(LOSE, newCard);
        } else {
          this.showMessage(DRAW, newCard);
        }
        return;
      }

      if (returnInt(newCard.value) < returnInt(oldCard.value)) {
        this.showMessage(WON, newCard);
      } else if (returnInt(newCard.value) > returnInt(oldCard.value)) {
        this.showMessage(LOSE, newCard);
      } else {
        this.showMessage(DRAW, newCard);
      }
    } catch (error) {
      Alert.alert("Error getting data!");
    }
  };

  newGame = async (url) => {
    const { selectedURL } = this.state;
    if (selectedURL !== EMPTY) {
      this.setState({
        selectedURL: EMPTY
      });
    }

    try {
      let deck = await request(url);
      let card = await request(
        `https://deckofcardsapi.com/api/deck/${deck.deck_id}/draw`
      );
      this.setState({
        deck_id: deck.deck_id,
        selectedURL: card.cards[0].images.png,
        selectedCard: card
      });
      this.storeDeckId(deck.deck_id);
    } catch (error) {
      Alert.alert("Error getting data!");
    }
  };

  storeDeckId = async (deckId) => {
    try {
      await AsyncStorage.setItem(DECK_ID, deckId);
      return true;
    } catch (error) {}
  };

  retrieveDeckId = async () => {
    try {
      return await AsyncStorage.getItem(DECK_ID);
    } catch (error) {}
  };

  clearStorage = () => {
    AsyncStorage.clear();
  };

  render() {
    const { selectedURL } = this.state;
    const yourGuess = selectedURL === EMPTY ? LOADING : YOUR_GUESS;

    return (
      <View style={styles.container}>
        <Text style={styles.header}>{HEADER}</Text>

        <View style={styles.hr} />

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: this.state.selectedURL || FALLBACK_URL }}
            style={{ width: 226, height: 314 }}
          />
        </View>

        <View style={styles.hr} />

        <Text style={styles.guess}>{yourGuess}</Text>

        <TouchableOpacity
          disabled={selectedURL === EMPTY}
          style={styles.button}
          onPress={() => this.placeBet(UP)}
        >
          <Text style={styles.buttonText}> {UP} </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={selectedURL === EMPTY}
          style={styles.button}
          onPress={() => this.placeBet(DOWN)}
        >
          <Text style={styles.buttonText}> {DOWN} </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    paddingTop: 20,
    paddingBottom: 20,
    fontWeight: "bold"
  },
  guess: {
    textAlign: "center",
    fontSize: 20,
    paddingTop: 20,
    paddingBottom: 10,
    fontWeight: "bold"
  },
  button: {
    backgroundColor: "#308834",
    padding: 10,
    marginLeft: 55,
    marginRight: 55,
    marginBottom: 15,
    height: 40
  },
  buttonText: {
    color: "white",
    textAlign: "center"
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  hr: {
    borderBottomColor: "gray",
    borderBottomWidth: 0.5
  }
});

export default App;
// export for test
export { returnInt };
