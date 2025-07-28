# flet é usado para a interface gráfica.
import flet as ft

# requests permite acessar a API REST de guitarras.
import requests


# Cria a tela onde o usuário pode excluir guitarras cadastradas.
# Recebe a página (page) e a função voltar_ao_menu.
def tela_extra(page: ft.Page, voltar_ao_menu):
    lista_guitarras = ft.Column()
    dialog = ft.AlertDialog(modal=True)
    id_selecionado = {"id": None}


    # Cria um botão de lixeira (ícone de exclusão) para cada guitarra.
    # Ao clicar, ele chama diretamente a função excluir_guitarra.
    def criar_botao_excluir(guitarra_id):
        def on_click_handler(e):
            print(f"Tentando excluir guitarra ID {guitarra_id} direto (sem diálogo)")
            excluir_guitarra(guitarra_id)
        return ft.IconButton(
            icon=ft.Icons.DELETE,
            tooltip="Excluir",
            on_click=on_click_handler
        )



    # Carrega as guitarras do servidor e exibe na tela.
    # Cada guitarra é exibida com seu ID, modelo, marca e preço.
    # Inclui um botão de exclusão ao lado de cada guitarra.
    def carregar_guitarras():
        lista_guitarras.controls.clear()
        try:
            response = requests.get("http://localhost:3000/guitarras")
            if response.status_code == 200:
                guitarras = response.json()
                for g in guitarras:
                    linha = ft.Row([
                        ft.Text(
                            f"Id: {g['id']} Modelo: {g['modelo']} Marca: {g['marca_id']} Preço: R$ {g['preco']:.2f}",
                            expand=True
                        ),
                        criar_botao_excluir(g['id'])
                    ])
                    lista_guitarras.controls.append(linha)
            else:
                lista_guitarras.controls.append(ft.Text("Erro ao carregar guitarras."))
        except Exception as e:
            lista_guitarras.controls.append(ft.Text(f"Erro: {e}"))
        page.update()

    # Abre um diálogo de confirmação antes de excluir uma guitarra.
    # Recebe o ID da guitarra a ser excluída e exibe uma mensagem de confirmação.
    # Se o usuário confirmar, chama a função excluir_guitarra.
    # Se cancelar, fecha o diálogo.
    def confirmar_exclusao(guitarra_id, e=None):
        id_selecionado["id"] = guitarra_id
        dialog.title = ft.Text("Confirmar Exclusão")
        dialog.content = ft.Text(f"Tem certeza que deseja excluir a guitarra de ID {guitarra_id}?")
        dialog.actions = [
            ft.TextButton("Cancelar", on_click=lambda e: fechar_dialogo()),
            ft.TextButton("Excluir", on_click=lambda e: excluir_guitarra(guitarra_id))
        ]
        page.dialog = dialog
        dialog.open = True
        print(f"Abrindo diálogo de exclusão para guitarra {guitarra_id}")
        page.update()

    def fechar_dialogo():
        dialog.open = False
        page.update()

    # Exclui a guitarra selecionada.
    # Faz uma requisição DELETE para o servidor.
    # Se a exclusão for bem-sucedida, atualiza a lista de guitarras
    # e exibe uma mensagem de sucesso.
    # Se ocorrer um erro, exibe uma mensagem de erro.
    def excluir_guitarra(id):
        try:
            response = requests.delete(f"http://localhost:3000/guitarras/{id}")
            if response.status_code in (200, 204):
                page.snack_bar = ft.SnackBar(ft.Text(f"Guitarra ID {id} excluída!"), open=True)
                fechar_dialogo()
                carregar_guitarras()
            else:
                page.snack_bar = ft.SnackBar(ft.Text("Erro ao excluir guitarra."), open=True)
        except Exception as e:
            page.snack_bar = ft.SnackBar(ft.Text(f"Erro: {e}"), open=True)
        page.update()

    page.controls.clear()
    page.add(
        ft.Text("Excluir Guitarras", size=25),
        ft.ElevatedButton("Voltar", on_click=lambda e: voltar_ao_menu()),
        ft.Divider(),
        ft.Text("Lista de Guitarras:", size=18, weight=ft.FontWeight.BOLD),
        lista_guitarras
    )

    # Exibe a lista logo que a tela é aberta.
    carregar_guitarras()
    page.update()
