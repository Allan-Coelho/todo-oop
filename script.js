class Task {
  constructor(id, name, completed) {
    this.id = id;
    this.name = name;
    this.completed = completed;
  }

  getView(boardId) {
    const taskContainer = document.createElement("li");
    taskContainer.classList.add("task");
    taskContainer.dataset.taskId = this.id;
    taskContainer.dataset.boardId = boardId;
    if (this.completed) {
      taskContainer.classList.add("completed");
    }

    const taskCheckbox = document.createElement("input");
    taskCheckbox.id = `checkbox-${this.id}-${Date.now()}`;
    taskCheckbox.classList.add("checkbox");
    taskCheckbox.type = "checkbox";
    taskCheckbox.checked = this.completed;
    taskCheckbox.addEventListener("click", () =>
      onCompleteTask(boardId, this.id)
    );
    taskContainer.appendChild(taskCheckbox);

    const taskName = document.createElement("label");
    taskName.classList.add("task-name");
    taskName.textContent = this.name;
    taskName.htmlFor = taskCheckbox.id;
    taskContainer.appendChild(taskName);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", () =>
      onDeleteTask(boardId, this.id)
    );
    taskContainer.appendChild(deleteButton);

    return taskContainer;
  }
}

class Board {
  constructor(id, title, tasks) {
    this.id = id;
    this.title = title;
    this.tasks = tasks;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  completeTask(taskId) {
    const task = this.tasks.find((task) => task.id === taskId);
    task.completed = !task.completed;
  }

  getView() {
    const boardContainer = document.createElement("div");
    boardContainer.classList.add("board");
    boardContainer.dataset.boardId = this.id;

    const htmlRow = document.createElement("div");
    htmlRow.classList.add("row");

    const duplicateButton = document.createElement("button");
    duplicateButton.classList.add("duplicate-button");
    duplicateButton.textContent = "Duplicate board";
    duplicateButton.addEventListener("click", () => this.onDuplicateBoard());
    htmlRow.appendChild(duplicateButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", () => this.onDeleteBoard());
    htmlRow.appendChild(deleteButton);

    boardContainer.appendChild(htmlRow);

    const boardTitle = document.createElement("p");
    boardTitle.classList.add("board-title");
    boardTitle.textContent = this.title;
    boardTitle.addEventListener("click", () => this.onBoardTitleClick());
    boardContainer.appendChild(boardTitle);

    const tasksContainer = document.createElement("ul");
    tasksContainer.classList.add("tasks");
    boardContainer.appendChild(tasksContainer);

    this.tasks.forEach((task) => {
      const taskContainer = task.getView(this.id);
      tasksContainer.appendChild(taskContainer);
    });

    const newTaskInput = document.createElement("input");
    newTaskInput.dataset.boardId = this.id;
    newTaskInput.classList.add("new-task-input");
    newTaskInput.type = "text";
    newTaskInput.placeholder = "Nova tarefa";
    newTaskInput.addEventListener("keypress", handleNewTaskInputKeypress);
    boardContainer.appendChild(newTaskInput);

    return boardContainer;
  }

  onDuplicateBoard() {
    const boardsContainer = document.querySelector(".boards");
    const newBoard = Board.fromJSON(this.toJSON());
    const lastBoardId = boards[boards.length - 1].id;
    newBoard.id = lastBoardId + 1;
    newBoard.title = `${newBoard.title} Copy`;

    const boardContainer = newBoard.getView();
    boardsContainer.appendChild(boardContainer);
    boards.push(newBoard);
  }

  onDeleteBoard() {
    const index = boards.findIndex((board) => board.id === this.id);
    boards.splice(index, 1);

    const boardContainer = document.querySelector(
      `[data-board-id="${this.id}"]`
    );
    boardContainer.remove();
  }

  static fromJSON(json) {
    const { id, title, tasks } = json;
    const board = new Board(id, title, []);
    tasks.forEach((taskJson) => {
      const task = new Task(taskJson.id, taskJson.name, taskJson.completed);
      board.addTask(task);
    });
    return board;
  }

  onBoardTitleClick() {
    const newTitle = prompt("Novo titulo do board");
    if (!newTitle) {
      alert("Insira o novo título!");
      return;
    }

    this.title = newTitle;

    const boardTitleElement = document.querySelector(
      `.board-${this.id} .board-title`
    );
    boardTitleElement.textContent = newTitle;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      tasks: this.tasks.map((task) => ({
        id: task.id,
        name: task.name,
        completed: task.completed,
      })),
    };
  }
}

function onDeleteBoard(boardId) {
  const index = boards.findIndex((board) => board.id === boardId);
  boards.splice(index, 1);

  const boardContainer = document.querySelector(`[data-board-id="${boardId}"]`);
  boardContainer.remove();
}

function handleNewTaskInputKeypress(e) {
  if (e.key === "Enter") {
    onAddTask(e.target.dataset.boardId, e.target.value);
    e.target.value = "";
  }
}

function handleNewBoardInputKeypress(e) {
  if (e.key === "Enter") {
    onAddBoard(e.target.value);
    e.target.value = "";
  }
}

function onAddBoard(newBoardTitle) {
  const lastBoardId = boards[boards.length - 1]?.id || 0;
  const board = new Board(lastBoardId + 1, newBoardTitle, []);
  boards.push(board);

  const boardsContainer = document.querySelector(".boards");
  const boardContainer = board.getView();
  boardsContainer.appendChild(boardContainer);
}

function onDeleteTask(boardId, taskId) {
  const board = boards.find((board) => board.id === boardId);
  board.deleteTask(taskId);

  const taskContainer = document.querySelector(
    `[data-task-id="${taskId}"][data-board-id="${boardId}"]`
  );
  taskContainer.remove();
}

function onCompleteTask(boardId, taskId) {
  const board = boards.find((board) => board.id === boardId);
  board.completeTask(taskId);

  const taskContainer = document.querySelector(
    `[data-task-id="${taskId}"][data-board-id="${boardId}"]`
  );
  taskContainer.classList.toggle("completed");
}

function onAddTask(boardId, newTaskName) {
  if (newTaskName === "") return;
  const board = boards.find((board) => board.id === Number(boardId));
  const lastTaskId = board.tasks[board.tasks.length - 1]?.id || 0;
  const task = new Task(lastTaskId + 1, newTaskName, false);
  board.addTask(task);

  const tasksContainer = document.querySelector(
    `[data-board-id="${boardId}"] .tasks`
  );
  const taskContainer = task.getView(Number(boardId));
  tasksContainer.appendChild(taskContainer);
}

const personalBoard = new Board(1, "Pessoal", [
  new Task(1, "tarefa 1", false),
  new Task(2, "tarefa 2", false),
  new Task(3, "tarefa 3", true),
  new Task(4, "tarefa 4", false),
  new Task(5, "tarefa 5", true),
]);

let boards = [personalBoard];

function renderBoards(boards) {
  const boardsContainer = document.querySelector(".boards");

  boards.forEach((board) => {
    const boardContainer = board.getView();

    boardsContainer.appendChild(boardContainer);
  });
}
renderBoards(boards);

const newBoardInput = document.querySelector(".new-board-input");
newBoardInput.addEventListener("keypress", handleNewBoardInputKeypress);
