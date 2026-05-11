import sys

from PyQt5.QtCore import QTimer, Qt
from PyQt5.QtWidgets import QApplication, QMessageBox, QWidget
from PyQt5.QtWidgets import QLabel, QVBoxLayout

from auth_client import authenticate_user
from lock_screen.login_ui import LoginUI
from windows_control import lock_workstation


class SessionStatusWindow(QWidget):
    def __init__(self, minutes_remaining: int, user_name: str) -> None:
        super().__init__()
        self.minutes_remaining = max(0, int(minutes_remaining or 0))
        self.seconds_remaining = self.minutes_remaining * 60
        self.warning_sent = False
        self.user_name = user_name

        self.setWindowTitle("Tempo de uso")
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint)
        self.setStyleSheet(
            """
            QWidget {
                background-color: rgba(3, 7, 18, 0.92);
                color: #dbfbe0;
                border: 1px solid #22c55e;
                border-radius: 14px;
            }
            QLabel {
                color: #dbfbe0;
            }
            """
        )

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 16, 20, 16)

        self.title_label = QLabel(f"Tempo restante para {self.user_name}")
        self.title_label.setStyleSheet("font-size: 18px; font-weight: 700;")
        self.time_label = QLabel("")
        self.time_label.setStyleSheet("font-size: 30px; font-weight: 800; color: #86efac;")
        self.status_label = QLabel("Sessão ativa")
        self.status_label.setStyleSheet("font-size: 12px; color: #86a893;")

        layout.addWidget(self.title_label)
        layout.addWidget(self.time_label)
        layout.addWidget(self.status_label)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.tick)
        self.update_display()
        self.timer.start(1000)

        self.adjustSize()
        self.setFixedWidth(360)

    def update_display(self) -> None:
        minutes = self.seconds_remaining // 60
        seconds = self.seconds_remaining % 60
        self.time_label.setText(f"{minutes:02d}:{seconds:02d}")

        if self.seconds_remaining <= 300 and not self.warning_sent:
            self.warning_sent = True
            QApplication.beep()
            self.status_label.setText("Atenção: faltam 5 minutos para o fim da sessão")
            self.time_label.setStyleSheet("font-size: 30px; font-weight: 800; color: #f87171;")

        if self.seconds_remaining > 300:
            self.status_label.setText("Sessão ativa")

    def tick(self) -> None:
        if self.seconds_remaining <= 0:
            self.timer.stop()
            QMessageBox.warning(
                self,
                "Tempo esgotado",
                "Tempo de uso encerrado. Procure o professor.",
            )
            lock_workstation()
            self.close()
            return

        self.seconds_remaining -= 1
        self.update_display()


class LoginWindow(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.ui = LoginUI()
        self.ui.login_button.clicked.connect(self.try_login)
        self.ui.forgot_button.clicked.connect(self.forgot_password)
        self.authenticated_user = None

        self.setWindowTitle("Login do Laboratorio")
        self.setWindowState(self.windowState() | self.ui.windowState())
        self.setLayout(self.ui.layout())

    def try_login(self) -> None:
        username = self.ui.username_input.text().strip()
        password = self.ui.password_input.text().strip()

        if not username or not password:
            self.ui.error_label.setText("Usuario e senha sao obrigatorios")
            return

        self.ui.login_button.setEnabled(False)
        self.ui.login_button.setText("Autenticando...")
        
        result = authenticate_user(username, password)
        
        if result and "access_token" in result:
            self.authenticated_user = {
                "username": username,
                "token": result["access_token"],
                "name": result.get("name", username),
                "role": result.get("role", "student"),
                "time_balance": result.get("time_balance", 0),
            }
            self.ui.error_label.setText("")
            QMessageBox.information(self, "Sucesso", "Login realizado com sucesso!")
            if self.authenticated_user.get("role") == "student":
                self.session_window = SessionStatusWindow(
                    self.authenticated_user.get("time_balance", 0),
                    self.authenticated_user.get("name", username),
                )
                self.session_window.show()
            self.close()
        else:
            self.ui.error_label.setText("Usuario ou senha incorretos")
            self.ui.password_input.clear()
        
        self.ui.login_button.setEnabled(True)
        self.ui.login_button.setText("Entrar")

    def forgot_password(self) -> None:
        QMessageBox.information(
            self,
            "Esqueci minha senha",
            "Procure o professor para redefinir sua senha.",
        )


def run_login_window() -> dict | None:
    app = QApplication(sys.argv)
    window = LoginWindow()
    window.showFullScreen()
    app.exec_()
    return window.authenticated_user
