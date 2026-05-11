from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)
from .matrix_terminal import MatrixTerminal


class LoginUI(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self._build_ui()

    def _build_ui(self) -> None:
        self.setStyleSheet(
            """
            QWidget { background-color: #030712; color: #dbfbe0; }
            QLineEdit { background: #051014; border: 1px solid #163d24; padding: 10px; border-radius: 8px; color: #dbfbe0; }
            QLineEdit::placeholder { color: #86a893; }
            QPushButton { background: #0b3420; color: #dbfbe0; border: 1px solid #22c55e; padding: 10px 14px; border-radius: 8px; }
            QPushButton:hover { background: #143f28; }
            QLabel { color: #dbfbe0; }
            """
        )

        # Layout: matrix terminal on left, login card on right
        main_row = QHBoxLayout()
        main_row.setContentsMargins(40, 40, 40, 40)

        # Matrix terminal
        terminal = MatrixTerminal(columns=24, rows=18)
        terminal.setFixedWidth(480)
        main_row.addWidget(terminal)

        # Card
        wrapper = QVBoxLayout()
        wrapper.setAlignment(Qt.AlignCenter)

        card = QVBoxLayout()
        card.setSpacing(10)

        title = QLabel("LAN Manager Escolar")
        title.setFont(QFont("Courier New", 22, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)

        subtitle = QLabel("Informe usuário e senha para liberar a máquina")
        subtitle.setAlignment(Qt.AlignCenter)

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Usuário")

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Senha")
        self.password_input.setEchoMode(QLineEdit.Password)

        self.error_label = QLabel("")
        self.error_label.setStyleSheet("color: #ff7a7a;")
        self.error_label.setAlignment(Qt.AlignCenter)

        button_row = QHBoxLayout()
        self.login_button = QPushButton("Entrar")
        self.forgot_button = QPushButton("Esqueci minha senha")
        self.forgot_button.setStyleSheet("background: #0a1b14; border: 1px solid #163d24; color: #86a893;")
        button_row.addWidget(self.login_button)
        button_row.addWidget(self.forgot_button)

        card.addWidget(title)
        card.addWidget(subtitle)
        card.addWidget(self.username_input)
        card.addWidget(self.password_input)
        card.addWidget(self.error_label)
        card.addLayout(button_row)

        container = QWidget()
        container.setLayout(card)
        container.setFixedWidth(520)

        wrapper.addWidget(container)
        main_row.addLayout(wrapper)

        self.setLayout(main_row)
