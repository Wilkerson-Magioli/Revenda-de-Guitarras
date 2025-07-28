# importa o Flet para criar a interface gráfica.
import flet as ft
# importa a biblioteca requests para fazer requisições HTTP.
import requests


# Cria a interface de cadastro de guitarras.
# Recebe dois parâmetros:
# page: objeto da página Flet.
# voltar_ao_menu: função a ser chamada ao clicar no botão "Voltar".
# A função define campos de entrada para o modelo e preço da guitarra,
# cria um dropdown para selecionar a marca, e uma lista para exibir guitarras cadastradas
# Faz uma requisição GET para obter as marcas disponíveis e exibi-las no dropdown.
# Define uma função para carregar as guitarras cadastradas do servidor e exibi-las na lista
# Define uma função para cadastrar uma nova guitarra, que valida os campos de entrada,
# faz uma requisição POST para o servidor e atualiza a lista de guitarras.
def tela_cadastro(page: ft.Page, voltar_ao_menu):

    modelo = ft.TextField(label="Modelo")
    preco = ft.TextField(label="Preço")

    res_marcas = requests.get("http://localhost:3000/marcas")
    marcas = res_marcas.json() if res_marcas.status_code == 200 else []

    dropdown_marcas = ft.Dropdown(
        label="Marca",
        options=[ft.dropdown.Option(key=str(m['id']), text=m['nome']) for m in marcas]
    )

    lista_guitarras = ft.Column()


    # Função para carregar as guitarras cadastradas do servidor e exibi-las na lista.
    # Essa função faz uma requisição GET para o endpoint "/guitarras" e atualiza a lista de guitarras na interface.
    # Se ocorrer algum erro, exibe uma mensagem de erro na lista.
    def carregar_guitarras():
        lista_guitarras.controls.clear()
        try:
            response = requests.get("http://localhost:3000/guitarras")
            if response.status_code == 200:
                guitarras = response.json()
                for g in guitarras:
                    linha = ft.Text(f"Id: {g['id']} Modelo: {g['modelo']} Marca: {g['marca_id']} Preço: R$ {g['preco']:.2f}")
                    lista_guitarras.controls.append(linha)
            else:
                lista_guitarras.controls.append(ft.Text("Erro ao carregar guitarras."))
        except Exception as e:
            lista_guitarras.controls.append(ft.Text(f"Erro: {e}"))
        page.update()

    # Essa função é chamada quando o botão Cadastrar é clicado.
    # Ela valida os campos de entrada (modelo, preço e marca),
    # e se tudo estiver correto, faz uma requisição POST para cadastrar a guitarra.
    # Se o cadastro for bem-sucedido, exibe uma mensagem de sucesso e atualiza a lista de guitarras.
    # Se ocorrer algum erro, exibe uma mensagem de erro.
    # A função também limpa os campos de entrada após o cadastro.
    # O campo "marca_id" deve ser enviado com o nome da marca selecionada e não com o ID, pois o servidor 
    # espera o nome da marca e o ID é computado automaticamente pelo servidor. 
    def cadastrar_guitarra(e):
        modelo_valor = modelo.value.strip()
        preco_valor = preco.value.strip()
        marca_valor = dropdown_marcas.value

        if not modelo_valor:
            page.snack_bar = ft.SnackBar(ft.Text("O modelo não pode estar vazio!"), open=True)
            page.update()
            return

        try:
            preco_float = float(preco_valor)
            if preco_float <= 0:
                raise ValueError
        except ValueError:
            page.snack_bar = ft.SnackBar(ft.Text("Informe um preço válido (maior que 0)!"), open=True)
            page.update()
            return

        if not marca_valor:
            page.snack_bar = ft.SnackBar(ft.Text("Selecione uma marca!"), open=True)
            page.update()
            return

        nome_marca = next((m['nome'] for m in marcas if m['id'] == marca_valor), None)

        dados = {
            "modelo": modelo_valor,
            "preco": preco_float,
            "marca_id": nome_marca  # Enviando o nome da marca como valor
            # Não envie o campo "id"
        }

        response = requests.post("http://localhost:3000/guitarras", json=dados)

        if response.status_code == 201:
            page.snack_bar = ft.SnackBar(ft.Text("Guitarra cadastrada com sucesso!"), open=True)
            modelo.value = ""
            preco.value = ""
            dropdown_marcas.value = None
            carregar_guitarras()
        else:
            page.snack_bar = ft.SnackBar(ft.Text("Erro ao cadastrar!"), open=True)
        page.update()

    # Expõe a função carregar_guitarras no objeto page para ser usada externamente.
    # Adiciona todos os elementos à tela: Título, Campos, Botões (Cadastrar e Voltar) e Lista de guitarras.
    page.carregar_guitarras = carregar_guitarras

    page.controls.clear()
    page.add(
        ft.Text("Cadastro de Guitarra", size=25),
        modelo,
        preco,
        dropdown_marcas,
        ft.Row([
            ft.ElevatedButton("Cadastrar", on_click=cadastrar_guitarra),
            ft.ElevatedButton("Voltar", on_click=lambda e: voltar_ao_menu())
        ]),
        ft.Divider(),
        ft.Text("Lista de Guitarras Cadastradas:", size=18, weight=ft.FontWeight.BOLD),
        lista_guitarras
    )

    carregar_guitarras()
    page.update()
