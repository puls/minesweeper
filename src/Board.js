import React, { Component } from "react";
import "./App.css";

class Board extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boardState: null,
      elapsedTime: 0,
      statusFace: "🙂",
      lossSquare: null
    };
    window.oncontextmenu = () => false;
  }

  componentWillUnmount() {
    window.clearInterval(this.timerInterval);
  }

  componentWillReceiveProps() {
    this.newGame();
  }

  newGame() {
    this.setState({
      boardState: null,
      elapsedTime: 0,
      statusFace: "🙂",
      lossSquare: null
    });
    window.clearInterval(this.timerInterval);
  }

  generateBoard({ rows, cols, mines, initialRow, initialCol }) {
    let success = true;
    let board = [];
    function check(row, col) {
      if (
        row >= 0 &&
        row < rows &&
        col >= 0 &&
        col < cols &&
        board[row][col].text === "💣"
      ) {
        return 1;
      }
      return 0;
    }

    do {
      success = true;
      let cells = [];
      for (let index = 0; index < mines; index++) {
        cells.push({ text: "💣" });
      }
      for (let index = mines; index < rows * cols; index++) {
        cells.push({ text: " " });
      }

      for (let index1 = cells.length - 1; index1 > 0; index1--) {
        const index2 = Math.floor(Math.random() * (index1 + 1));
        const value = cells[index1];
        cells[index1] = cells[index2];
        cells[index2] = value;
      }

      board = [];
      while (cells.length > 0) {
        board.push(cells.splice(0, cols));
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let adjacentMineCount = 0;

          adjacentMineCount += check(row - 1, col - 1);
          adjacentMineCount += check(row - 1, col);
          adjacentMineCount += check(row - 1, col + 1);
          adjacentMineCount += check(row, col - 1);
          adjacentMineCount += check(row, col + 1);
          adjacentMineCount += check(row + 1, col - 1);
          adjacentMineCount += check(row + 1, col);
          adjacentMineCount += check(row + 1, col + 1);

          if (adjacentMineCount === 8) {
            success = false;
          }
          if (board[row][col].text === " ") {
            board[row][col].text = adjacentMineCount;
          }
          board[row][col].hidden = true;
          board[row][col].marked = false;
        }
      }

      if (board[initialRow][initialCol].text !== 0) {
        success = false;
      }
    } while (!success);

    this.timerInterval = window.setInterval(this.updateTimer.bind(this), 100);
    this.startDate = Date.now();

    return board;
  }

  updateTimer() {
    const elapsedTime = Math.floor((Date.now() - this.startDate) / 1000);
    this.setState({ elapsedTime });
  }

  revealBoard() {
    let boardState = this.state.boardState;
    for (let rowIndex = 0; rowIndex < this.props.rows; rowIndex++) {
      for (let colIndex = 0; colIndex < this.props.cols; colIndex++) {
        if (
          !boardState[rowIndex][colIndex].marked &&
          boardState[rowIndex][colIndex].text === "💣"
        ) {
          if (this.state.lossSquare != null) {
            boardState[rowIndex][colIndex].hidden = false;
          } else {
            boardState[rowIndex][colIndex].marked = true;
          }
        }
      }
    }
    this.setState({ boardState });
    window.clearInterval(this.timerInterval);
  }

  countCells(condition) {
    if (this.state.boardState == null) {
      return 0;
    }

    return this.state.boardState.reduce((acc, val) => {
      return (
        acc +
        val.reduce((acc2, val2) => {
          return acc2 + (condition(val2) ? 1 : 0);
        }, 0)
      );
    }, 0);
  }

  get isWinningCondition() {
    return this.countCells(cell => cell.hidden) === this.props.mines;
  }

  revealHiddenCell(boardState, rowIndex, colIndex) {
    const rows = this.props.rows;
    const cols = this.props.cols;
    if (rowIndex < 0 || rowIndex >= rows || colIndex < 0 || colIndex >= cols) {
      return;
    }

    const cell = boardState[rowIndex][colIndex];
    if (cell.marked || !cell.hidden) {
      return;
    }
    boardState[rowIndex][colIndex].hidden = false;
    if (cell.text === 0) {
      this.revealHiddenCell(boardState, rowIndex - 1, colIndex - 1);
      this.revealHiddenCell(boardState, rowIndex - 1, colIndex);
      this.revealHiddenCell(boardState, rowIndex - 1, colIndex + 1);
      this.revealHiddenCell(boardState, rowIndex, colIndex - 1);
      this.revealHiddenCell(boardState, rowIndex, colIndex + 1);
      this.revealHiddenCell(boardState, rowIndex + 1, colIndex - 1);
      this.revealHiddenCell(boardState, rowIndex + 1, colIndex);
      this.revealHiddenCell(boardState, rowIndex + 1, colIndex + 1);
    } else if (cell.text === "💣") {
      this.setState({ lossSquare: { row: rowIndex, col: colIndex } });
      return;
    }
  }

  handleMouseDown() {
    this.setState({ statusFace: "😧" });
  }

  handleClick(rowIndex, colIndex, event) {
    const rows = this.props.rows;
    const cols = this.props.cols;
    if (rowIndex < 0 || rowIndex >= rows || colIndex < 0 || colIndex >= cols) {
      return;
    }
    let boardState = this.state.boardState;
    if (boardState == null) {
      boardState = this.generateBoard({
        rows: this.props.rows,
        cols: this.props.cols,
        mines: this.props.mines,
        initialRow: rowIndex,
        initialCol: colIndex
      });
    }

    const cell = boardState[rowIndex][colIndex];
    if (cell.hidden) {
      if (event != null && event.button === 2) {
        cell.marked = !cell.marked;
      } else if (!cell.marked) {
        this.revealHiddenCell(boardState, rowIndex, colIndex);
      }
    } else if (cell.text > 0) {
      function checkForMarked(row, col) {
        if (
          row >= 0 &&
          row < rows &&
          col >= 0 &&
          col < cols &&
          boardState[row][col].marked
        ) {
          return 1;
        }
        return 0;
      }
      let adjacentMarkedCount = 0;
      adjacentMarkedCount += checkForMarked(rowIndex - 1, colIndex - 1);
      adjacentMarkedCount += checkForMarked(rowIndex - 1, colIndex);
      adjacentMarkedCount += checkForMarked(rowIndex - 1, colIndex + 1);
      adjacentMarkedCount += checkForMarked(rowIndex, colIndex - 1);
      adjacentMarkedCount += checkForMarked(rowIndex, colIndex + 1);
      adjacentMarkedCount += checkForMarked(rowIndex + 1, colIndex - 1);
      adjacentMarkedCount += checkForMarked(rowIndex + 1, colIndex);
      adjacentMarkedCount += checkForMarked(rowIndex + 1, colIndex + 1);
      if (cell.text === adjacentMarkedCount) {
        this.revealHiddenCell(boardState, rowIndex - 1, colIndex - 1);
        this.revealHiddenCell(boardState, rowIndex - 1, colIndex);
        this.revealHiddenCell(boardState, rowIndex - 1, colIndex + 1);
        this.revealHiddenCell(boardState, rowIndex, colIndex - 1);
        this.revealHiddenCell(boardState, rowIndex, colIndex + 1);
        this.revealHiddenCell(boardState, rowIndex + 1, colIndex - 1);
        this.revealHiddenCell(boardState, rowIndex + 1, colIndex);
        this.revealHiddenCell(boardState, rowIndex + 1, colIndex + 1);
      }
    }
    this.setState({ boardState }, () => {
      if (this.state.lossSquare != null) {
        this.setState({ statusFace: "😵" });
        this.revealBoard();
      } else if (this.isWinningCondition) {
        this.setState({ statusFace: "😎" });
        this.revealBoard();
      } else {
        this.setState({ statusFace: "🙂" });
      }
    });
  }

  renderCol(rowIndex, colIndex) {
    let cell = { text: "", hidden: true };
    if (this.state.boardState != null) {
      cell = this.state.boardState[rowIndex][colIndex];
    }
    const numbersAsWords = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight"
    ];
    let classes =
      "cell " + (cell.hidden ? "hidden" : numbersAsWords[cell.text]);
    if (cell.marked) {
      classes += " marked";
    }
    if (
      this.state.lossSquare != null &&
      this.state.lossSquare.row === rowIndex &&
      this.state.lossSquare.col === colIndex
    ) {
      classes += " lossSquare";
    }
    return (
      <div
        className={classes}
        key={`row${rowIndex}col${colIndex}`}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseUp={this.handleClick.bind(this, rowIndex, colIndex)}
      >
        <div className="cellBorder">
          <div className="cellInner">
            {cell.marked
              ? "🚩"
              : cell.text === 0 || cell.hidden ? "\u00A0" : cell.text}
          </div>
        </div>
      </div>
    );
  }

  renderRow(index) {
    let cols = [];
    for (let colIndex = 0; colIndex < this.props.cols; colIndex++) {
      cols.push(this.renderCol(index, colIndex));
    }
    return <div className="row" key={`row${index}`}>{cols}</div>;
  }

  render() {
    let rows = [];
    const remainingMines =
      this.props.mines -
      (this.state.boardState != null
        ? this.countCells(cell => cell.marked)
        : 0);
    for (let index = 0; index < this.props.rows; index++) {
      rows.push(this.renderRow(index));
    }
    return (
      <div className="everything">
        <div className="header">
          <div className="elapsed">{this.state.elapsedTime}</div>
          <div className="remaining">{remainingMines}</div>
          <div className="status" onClick={this.newGame.bind(this)}>
            {this.state.statusFace}
          </div>
          <div style={{ clear: "both" }} />
        </div>
        <div className="board">
          {rows}
          <div className="row" key="rowLast" />
        </div>
      </div>
    );
  }
}

export default Board;
