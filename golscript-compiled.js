var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var playback = {
  "paused": "no",
  "anim": null
};

var Button = React.createClass({
  displayName: "Button",

  render: function () {
    return React.createElement("button", _extends({}, this.props, { className: "panel-button" }));
  }
});

var Panel = React.createClass({
  displayName: "Panel",

  render: function () {
    var list = ["play", "pause", "clear"];
    return React.createElement(
      "div",
      _extends({}, this.props, { className: "control-panel" }),
      list.map(function (data) {
        return React.createElement(
          Button,
          { id: data },
          data
        );
      })
    );
  }
});

var Cell = React.createClass({
  displayName: "Cell",

  render: function () {
    return React.createElement("div", this.props);
  }
});

var GameBox = React.createClass({
  displayName: "GameBox",

  //create random cells in list
  getInitialState: function () {
    return {
      list: this.createCells()
    };
  },

  //initial rows and columns
  getDefaultProps: function () {
    return {
      rows: 50,
      cols: 50
    };
  },

  //for converting cartesian coordinates
  //to the relevant index in cell array
  Num: function (r, c) {
    return r * this.props.cols + c;
  },

  //returns number of live neighbors of
  //a cell at [row, col] in the grid
  checkalive: function (row, col) {
    var cellarr = this.state.list.slice(),
        _cols = this.props.cols,
        _rows = this.props.rows,
        ind = this.Num(row, col),
        top = ind - _cols,
        bottom = ind + _cols,
        S = ind + _cols,
        N = ind - _cols,
        W = ind - 1,
        E = ind + 1,
        NW = top - 1,
        NE = top + 1,
        SW = bottom - 1,
        SE = bottom + 1,
        neighbors = [];
    //corner cases--literally

    //top row
    if (row === 0) {
      top = ind + (_rows - 1) * _cols, N = top, NE = top + 1, NW = top - 1;
      //top-left corner
      if (col === 0) {
        SW = _rows + _cols - 1, W = _cols - 1, NW = _rows * _cols - 1;
      }
      //top-right corner
      else if (col == _cols - 1) {
          SE = ind + 1, E = 0, NE = (_rows - 1) * _cols;
        }
    }

    //bottom row
    else if (row == _rows - 1) {
        S = ind - (_rows - 1) * _cols, SW = S - 1, SE = S + 1;

        //bottom-left corner
        if (col === 0) {
          SW = _cols - 1, W = _rows * _cols - 1, NW = ind - 1;
        }
        //bottom-right corner
        else if (col == _cols - 1) {
            E = ind - _cols + 1, NE = ind - 2 * _cols + 1, SE = 0;
          }
      }

      //all cells on left edge except those on bottom
      //and top
      else if (row !== 0 && row != _rows && col === 0) {
          W = ind + _cols - 1, SW = ind + 2 * _cols - 1, NW = ind - 1;
        }

        //all cells on right edge except those on
        //bottom and top
        else if (row !== 0 && row != _rows && col == _cols - 1) {
            E = ind - _cols + 1, NE = ind - 2 * _cols + 1, SE = ind + 1;
          }

    //get indices of all 8 neighbors
    neighbors.push(N, NW, NE, S, SW, SE, W, E);
    var countlive = 0;
    for (var jj in neighbors) {
      if (cellarr[neighbors[jj]] == "alive") {
        countlive++;
      }
    }
    return countlive;
  },

  //will only be called once, at the beginning
  //creates random cells
  createCells: function (option) {
    var choice;
    var arr = [];
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        if (option == "dead" || option == "alive") {
          console.log(option);
          choice = option;
        } else {
          choice = Math.floor(Math.random() * 10) == 1 ? "alive" : "dead";
        }
        arr.push(choice);
      }
    }
    return arr;
  },

  //this is the main animation function
  //it changes every time props are recieved
  //the time prop changes every X seconds and
  //thus the animation is started
  componentWillReceiveProps: function () {
    var ls = this.state.list.slice();
    for (var r = 0; r < this.props.rows; r++) {
      for (var c = 0; c < this.props.cols; c++) {
        var ind = this.checkalive(r, c),
            actind = this.Num(r, c);
        status = ls[actind];
        //Conway's Game of Life:
        //A dead cell becomes alive iff it has 3 live neighbors
        if (status == "dead") {
          if (ind == 3) ls[actind] = "alive";
        }
        //a live cell dies when surrounded by less than 2 neighbors
        //or more than 3 neighbors
        else {
            if (ind < 2) ls[actind] = "dead";else if (ind > 3) ls[actind] = "dead";
          }
      }
    }

    //change the state
    //this causes us to have only one state component
    //all cells are stateless
    this.setState(function () {
      return { list: ls };
    });
  },

  handleClick: function (e) {
    console.log(e.target.id);

    if (e.target.id == "play" && playback.paused == "yes") {
      playback.paused = "no";
      window.requestAnimationFrame(playback.anim);
      return;
    } else if (e.target.id == "pause" && playback.paused == "no") {
      playback.paused = "yes";
      return;
    } else if (e.target.id == "clear") {
      playback.paused = "yes";
      this.setState(function () {
        return { list: this.createCells("dead") };
      });
      return;
    }

    var ls = e.target.classList;
    var cop = this.state.list.slice();
    var ind = +e.target.id.slice(4);
    for (var i in ls) {
      if (ls[i] == "cell-alive") {
        e.target.classList.remove("cell-alive");
        e.target.classList.add("cell-dead");
        cop[ind] = "dead";
        break;
      } else if (ls[i] == "cell-dead") {
        e.target.classList.remove("cell-dead");
        e.target.classList.add("cell-alive");
        cop[ind] = "alive";
        break;
      }
    }
    this.setState(function () {
      return { list: cop };
    });
  },

  //render the cells
  render: function () {
    var rows = this.props.rows,
        cols = this.props.cols;
    return React.createElement(
      "div",
      { className: this.props.className, onClick: this.handleClick },
      React.createElement(Panel, { id: "panel" }),
      this.state.list.map(function (data, index) {
        return React.createElement(Cell, { className: "cell cell-" + data, id: "val-" + index, key: index });
      })
    );
  }
});

(function () {
  //time: to keep the animation going and get the generation
  var time = 0;
  playback.anim = function () {
    time += 1;
    ReactDOM.render(React.createElement(GameBox, { className: "outerbox", times: time }), document.getElementById("Board"));
    if (playback.paused == "no") {
      window.requestAnimationFrame(playback.anim);
    }
  };
  window.requestAnimationFrame(playback.anim);
}).call(this);
