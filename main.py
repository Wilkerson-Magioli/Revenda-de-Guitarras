# biblioteca para criar interfaces gráficas com Python.
import flet as ft

# para comunicação HTTP (não usada diretamente nesse arquivo, mas pode ser usada indiretamente).
import requests

# função responsável por exibir a tela com o gráfico (importada diretamente).
from telas.grafico import tela_grafico


# Variável global para guardar referência da tela cadastro.
# Guarda uma referência à tela de cadastro, caso seja necessário interagir com ela. 
cadastro_screen = None


# Essa é a função inicial do app Flet. Recebe o objeto page onde os elementos são renderizados.
def main(page: ft.Page):
    page.title = "Revenda de Guitarras"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 20


# Essa função exibe o menu principal com os botões de navegação.
# Adiciona título e três botões: "Cadastro", "Gráfico" e "Função Extra".
# Os três botões estão ligados à função navegar.
    def mostrar_menu():
        page.controls.clear()
        menu = ft.Column([
            ft.Text("Revenda de Guitarras", size=30, weight=ft.FontWeight.BOLD),
            ft.ElevatedButton("Cadastro", on_click=navegar),
            ft.ElevatedButton("Gráfico", on_click=navegar),
            ft.ElevatedButton("Função Extra", on_click=navegar),
        ])
        page.add(menu)
        page.update()

    # Essa função é chamada sempre que um botão do menu é clicado
    def navegar(e):
        global cadastro_screen
        page.controls.clear()
        match e.control.text:
            case "Cadastro":
                from telas.cadastro import tela_cadastro
                cadastro_screen = tela_cadastro(page, mostrar_menu)

            case "Gráfico":
                # Correção aqui — passando a função mostrar_menu como parâmetro
                tela_grafico(page, mostrar_menu)

            case "Função Extra":
                from telas.extra import tela_extra
                tela_extra(page, mostrar_menu)

                # Se já carregou cadastro, atualiza a lista ao voltar do extra
                if cadastro_screen and hasattr(page, "carregar_guitarras"):
                    page.carregar_guitarras()

        page.update()

    mostrar_menu() # Mostra o menu principal assim que o app é iniciado.

# Ponto de entrada da aplicação Flet.
# Executa a função main() e inicia o app.
ft.app(target=main)
