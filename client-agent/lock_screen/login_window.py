import sys

from PyQt5.QtWidgets import QApplication, QMessageBox, QWidget

from auth_client import authenticate_user
from lock_screen.login_ui import LoginUI


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
            }
            self.ui.error_label.setText("")
            QMessageBox.information(self, "Sucesso", "Login realizado com sucesso!")
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
