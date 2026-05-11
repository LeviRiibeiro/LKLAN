from PyQt5.QtCore import QTimer, Qt
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import QLabel, QWidget, QVBoxLayout

import random


class MatrixTerminal(QWidget):
    def __init__(self, columns: int = 40, rows: int = 12, parent=None) -> None:
        super().__init__(parent)
        self.columns = columns
        self.rows = rows
        self.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*"

        self.label = QLabel()
        self.label.setAlignment(Qt.AlignLeft | Qt.AlignTop)
        self.label.setFont(QFont("Courier New", 10))
        self.label.setStyleSheet("color: #22c55e; background: transparent;")
        self.label.setTextInteractionFlags(Qt.NoTextInteraction)

        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.label)
        self.setLayout(layout)

        self.columns_state = ["" for _ in range(self.columns)]
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._tick)
        self.timer.start(120)

    def _tick(self) -> None:
        # Update columns randomly
        for i in range(self.columns):
            if random.random() < 0.2:
                # start new drop
                length = random.randint(1, self.rows)
                self.columns_state[i] = "".join(random.choice(self.chars) for _ in range(length))
            else:
                # decay existing
                if self.columns_state[i]:
                    self.columns_state[i] = self.columns_state[i][1:]

        # Build lines from column characters
        lines = [""] * self.rows
        for col in self.columns_state:
            for r in range(self.rows):
                ch = col[r] if r < len(col) else " "
                lines[r] += ch + " "

        self.label.setText("\n".join(lines))
