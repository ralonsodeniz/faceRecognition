import React, { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SingIn from "./components/SingIn/SingIn";
import Register from "./components/Register/Register";
import Particles from "react-particles-js";

const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
};

const initialState = {
  // we do this to have a initial state everytime we singout a user so the state of the app is clean everytime we signin a new user
  input: "",
  imageUrl: "",
  box: [],
  route: "signIn",
  isSignedIn: false, // we will use this state to keep track of where are we in the application
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  calculateFaceLocation = data => {
    const clarifaiFace = data.outputs[0].data.regions;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    const arrayOfFaces = clarifaiFace.reduce((tempArray, element) => {
      const faceObject = {
        leftCol: element.region_info.bounding_box.left_col * width,
        topRow: element.region_info.bounding_box.top_row * height,
        rightCol: width - element.region_info.bounding_box.right_col * width,
        bottomRow: height - element.region_info.bounding_box.bottom_row * height
      };
      tempArray.push(faceObject);
      return tempArray;
    }, []);
    return arrayOfFaces;
  };

  displayFaceBox = box => {
    this.setState({ box: box });
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onSubmit = () => {
    // setState is a callback function (asynchronous) and if you do not wait for it to execute you will try to get a value that it is not resolved yet from the imageUrl state
    // one way to solve this is to use the second parameter of setState method which is a callback function that is executed after the state is updated
    this.setState({ imageUrl: this.state.input }, () => {
      fetch("https://facerecognitionapirad.herokuapp.com/imageurl", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: this.state.imageUrl })
      })
        .then(response => response.json())
        .then(response => {
          console.log(response);
          if (response && response.outputs) {
            fetch("https://facerecognitionapirad.herokuapp.com/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: this.state.user.id })
            })
              .then(response => response.json())
              .then(count => {
                this.setState(
                  Object.assign(this.state.user, { entries: count }) // since we only want to change 1 property of the object but we want to keep the rest we have to use Object.assing to make a copy of the user object with the updated entry
                );
              })
              .catch(console.log); // this is the same as .catch(err => console.log (err))
            this.displayFaceBox(this.calculateFaceLocation(response));
          } else {
            this.setState({
              input: "",
              imageUrl: "",
              box: []
            }); // since we only want to change 1 property of the object but we want to keep the rest we have to use Object.assing to make a copy of the user object with the updated entry
          }
        })
        .catch(err => console.log(err));
    });
  };

  // another option (which is not in the documentation but I have found) is to make the function async and await for the setState to finish
  // onSubmitAsync = async () => {
  //   await this.setState({ imageUrl: this.state.input });
  //   app.models
  //     .predict(Clarifai.FACE_DETECT_MODEL, this.state.imageUrl)
  //     .then(response => this.calculateFaceLocation(response))
  //     .catch(err => console.log(err)); // there was an error
  // };

  onRouteChange = route => {
    if (route === "register" || route === "signIn") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          onRouteChange={this.onRouteChange}
          isSignedIn={isSignedIn}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onSubmit={this.onSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : this.state.route === "signIn" ? (
          <SingIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        ) : (
          <Register
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
          />
        )}
      </div>
    );
  }
}

export default App;
