interface CellBoundaries {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
}

enum CellState {
  Flag,
  Mine,
  None,
  QuestionMark,
}

enum GameState {
  EmptyBoard,
  GameLost,
  GameWon,
  InProgress,
}

enum PublicBoardValue {
  Mine = -4,
  QuestionMark,
  Flag,
  Undiscovered,
  Zero,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
}

const getSurroundingIndexes = (cell: Cell) => {
  const boundaries = cell.getBoundaries();
  const index = cell.getIndex();

  const surroundingIndexes: number[] = [];

  if (!boundaries.top) {
    surroundingIndexes.push(index - this.width);

    if (!boundaries.left) {
      surroundingIndexes.push(index - this.width - 1);
    }
  }

  if (!boundaries.left) {
    surroundingIndexes.push(index - 1);

    if (!boundaries.bottom) {
      surroundingIndexes.push(index + this.width - 1);
    }
  }

  if (!boundaries.bottom) {
    surroundingIndexes.push(index + this.width);

    if (!boundaries.right) {
      surroundingIndexes.push(index + this.width + 1);
    }
  }

  if (!boundaries.right) {
    surroundingIndexes.push(index + 1);

    if (!boundaries.top) {
      surroundingIndexes.push(index - this.width + 1);
    }
  }

  return surroundingIndexes;
}

class Cell {
  private boundaries: CellBoundaries;
  private state = CellState.None;
  private value = 0;
  private discovered = false;
  private index: number;

  constructor(height: number, width: number, index: number) {
    this.boundaries = {
      top: index < width,
      bottom: index >= width * height - width,
      left: index % width === 0,
      right: index % width === width - 1,
    }
    this.index = index;
  }

  public getBoundaries = () => this.boundaries;
  public getState = () => this.state;
  public getValue = () => this.value;
  public getDiscovered = () => this.discovered;
  public getIndex = () => this.index;

  public createMine = () => {
    this.state = CellState.Mine;
  }

  public discoverCell = () => {
    if (
      this.discovered === true
      || this.state === CellState.Flag
      || this.state === CellState.QuestionMark
    ) {
      return;
    }

    this.discovered = true;
  }

  public incrementValue = () => {
    this.value++;
  }
}

class Board {
  private board: Cell[];
  private cellsToDiscover: number;
  private gameState = GameState.EmptyBoard;
  private height: number;
  private mineCount: number;
  private width: number;

  constructor(height: number, mineCount: number, width: number) {
    this.board = new Array(height * width)
    .fill(undefined)
    .map((_, index) => new Cell(height, width, index));
    this.cellsToDiscover = width * height - mineCount;
    this.height = height;
    this.mineCount = mineCount;
    this.width = width;
  }

  public getPublicBoard = (): PublicBoardValue[] => this.board.map(cell => {
    const cellState = cell.getState();

    if (cell.getDiscovered()) {
      return cellState === CellState.Mine ? PublicBoardValue.Mine : cell.getValue();
    }
    switch (cellState) {
      case CellState.Flag:
        return PublicBoardValue.Flag;

      case CellState.QuestionMark:
        return PublicBoardValue.QuestionMark;

      default:
        return PublicBoardValue.Undiscovered;
    }
  });

  public discoverCell = (index: number) => {
    if (index > this.board.length) {
      return;
    }

    const cell = this.board[index];

    if (cell.getDiscovered() === true) {
      return;
    }

    cell.discoverCell();

    if (cell.getDiscovered() !== true) {
      return;
    }

    this.cellsToDiscover--;

    const cellState = cell.getState();

    if (cellState === CellState.Mine) {
      this.loseGame();
      return;
    }

    if (this.cellsToDiscover === 0) {
      this.winGame();
      return;
    }

    const surroundingIndexes = getSurroundingIndexes(cell);

    if (this.gameState === GameState.EmptyBoard) {
      this.generateMines(index, surroundingIndexes);
    }

    const cellValue = cell.getValue();

    if (cellValue === 0) {
      this.discoverSurroundingCells(index, surroundingIndexes);
      return;
    }
  }

  private discoverSurroundingCells = (index: number, surroundingIndexes: number[]) => {
    surroundingIndexes.forEach((index: number) => this.discoverCell(index));
  }

  private generateMines = (index: number, surroundingIndexes: number[]) => {
    const cellMines: Cell[] = [];

    for (let i = 0; i < this.mineCount; i++) {
      let mineIndex;

      do {
        mineIndex = Math.floor(Math.random() * this.width * this.height)
      } while (!surroundingIndexes.includes(mineIndex));

      const cell = this.board[mineIndex];
      cell.createMine();
      cellMines.push(cell);
    }

    this.initializeCellValues(cellMines);
    this.gameState = GameState.InProgress;
  }

  private initializeCellValues = (cellMines: Cell[]) => {
    cellMines.forEach(cell => {
      const surroundingIndexes = getSurroundingIndexes(cell);
      surroundingIndexes.forEach(index => {
        const cell = this.board[index];
        cell.incrementValue();
      });
    });
  }

  private loseGame = () => {
    this.gameState = GameState.GameLost;
  }

  private winGame = () => {
    this.gameState = GameState.GameWon;
  }
}

const findDifference = (before: PublicBoardValue[], after: PublicBoardValue[]) => {
  const result = {};
  for (let i = 0; i < before.length; i++) {
    if (before[i] === after[i]) {
      return;
    }

    result[i] = after[i];
  }
};

let board: Board;
const startGame = (height: number, mineCount: number, width: number) => {
  board = new Board(height, mineCount, width);
}

const discoverCell = (index: number) => {
  const before = board.getPublicBoard();
  board.discoverCell(index);
  const after = board.getPublicBoard();

  const difference = findDifference(before, after);
  return JSON.stringify(difference);
}
