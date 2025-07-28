# importa o Flet para criar a interface gráfica.
import flet as ft
# importa a biblioteca requests para fazer requisições HTTP.
import requests

API_URL = "http://localhost:3000/guitarras"


# Essa função monta a tela gráfica que mostra quantas guitarras há por marca. Recebe:
# page: a página Flet onde os elementos são desenhados.
# voltar_ao_menu: função chamada ao clicar no botão "Voltar".
def tela_grafico(page: ft.Page, voltar_ao_menu):


# Essa função obtém os dados das guitarras da API e organiza a quantidade de guitarras por marca.
# Ela faz uma requisição GET para o endpoint "/guitarras" e retorna uma lista de guitarras.
# Se ocorrer algum erro, exibe uma mensagem de erro na tela.
    page.title = "Produtos por Marca"
    def obter_guitarras_api():
        try:
            response = requests.get(API_URL)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            page.snack_bar = ft.SnackBar(ft.Text(f"Erro ao carregar produtos: {err}"))
            page.snack_bar.open = True
            page.update()
            return []

    guitarras = obter_guitarras_api()
    
    # O dicionario será usado para contar quantas guitarras existem por marca
    dicionario = {}

# Para cada guitarra, incrementa a contagem de sua marca no dicionário.Exemplo: {'Fender': 2, 'Ibanez': 3}
    for p in guitarras:
        marca_id = p['marca_id']
        dicionario[marca_id] = dicionario.get(marca_id, 0) + 1

# Se não houver guitarras, mostra uma mensagem informando isso e o botão "Voltar".
    if not dicionario:
        page.controls.clear()
        page.controls.append(ft.Text("Nenhum dado disponível."))
        page.controls.append(ft.ElevatedButton("Voltar", on_click=lambda e: voltar_ao_menu()))
        page.update()
        return

# Lista de cores usadas para cada barra do gráfico.
    cores = [
        ft.Colors.BLUE,
        ft.Colors.GREEN,
        ft.Colors.ORANGE,
        ft.Colors.PINK,
        ft.Colors.PURPLE,
        ft.Colors.CYAN,
        ft.Colors.RED,
        ft.Colors.YELLOW,
        ft.Colors.AMBER,
        ft.Colors.BROWN
    ]

    largura_max = 500 # # Largura máxima da barra mais longa.
    maior_qtd = max(dicionario.values()) # Maior quantidade (serve de referência)
    total_produtos = sum(dicionario.values()) # Soma total de guitarras 

    linhas = [] # Lista que armazenará os componentes visuais (linhas) do gráfico.
    
    # Gera uma barra proporcional à quantidade da marca.
    for i, (marca_id, qtd) in enumerate(dicionario.items()):
        largura_barra = (qtd / maior_qtd) * largura_max # Calcula largura proporcional
        percentual = (qtd / total_produtos) * 100 # Percentual da marca
        cor = cores[i % len(cores)] # Cor baseada na posição

    # Cria a barra de cor que representa a marca no gráfico.    
        barra = ft.Container(
            width=largura_barra,
            height=30,
            bgcolor=cor,
            border_radius=5,
        )

    # Cria a linha que contém o ID da marca, a barra colorida e o texto com a quantidade e percentual.
        linha = ft.Row(
            [
                ft.Text(str(marca_id), width=100),
                barra,
                ft.Text(f"{qtd} produto(s) — {percentual:.1f}%", width=160, text_align=ft.TextAlign.RIGHT)
            ],
            alignment=ft.MainAxisAlignment.START,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            spacing=10
        )

        linhas.append(linha) # Adiciona a linha à lista de linhas do gráfico.

    # Monta a coluna principal com as linhas e o botão voltar:
    coluna = ft.Column(
        [
            ft.Text("Produtos por Marca", size=22, weight="bold"),
            *linhas,
            ft.Divider(),
            ft.ElevatedButton("Voltar", on_click=lambda e: voltar_ao_menu())
        ],
        spacing=10,
        scroll=ft.ScrollMode.AUTO
    )

    # Limpa a página e adiciona a coluna com o gráfico.
    # Atualiza a página para exibir o gráfico.
    page.controls.clear()
    page.controls.append(coluna)
    page.update()
