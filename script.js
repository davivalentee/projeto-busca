const API_KEY = "AIzaSyAKimv55iGPsqPs2UFhwxDWi85G9UmghSU"

let currentPage = 0
const maxResults = 10
let lastSearch = ""

// Loader
function toggleLoader(show){
  document.getElementById("loader").classList.toggle("hidden", !show)
}

// Dark mode
function toggleDarkMode(){
  document.body.classList.toggle("dark")
}

// Buscar
async function buscarLivros(){

  const query = document.getElementById("searchInput").value.trim()

  if(!query){
    alert("Digite um tema")
    return
  }

  currentPage = 0
  lastSearch = query

  carregarLivros()
}

// Carregar livros
async function carregarLivros(){

  const lang = document.getElementById("languageFilter").value
  const startIndex = currentPage * maxResults

  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(lastSearch)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`

  if(lang) url += `&langRestrict=${lang}`

  try{
    toggleLoader(true)

    const res = await fetch(url)

    if(!res.ok){
      throw new Error("Erro na API")
    }

    const data = await res.json()

    toggleLoader(false)

    if(!data.items){
      document.getElementById("results").innerHTML = "<p>Nenhum livro encontrado.</p>"
      document.getElementById("totalPages").innerText = ""
      return
    }

    mostrarLivros(data.items)

  }catch(e){
    toggleLoader(false)
    document.getElementById("results").innerHTML = "<p>Erro ao buscar dados.</p>"
    console.error(e)
  }
}

// Mostrar livros
function mostrarLivros(livros){

  const container = document.getElementById("results")
  container.innerHTML = ""

  let totalPages = 0

  const sort = document.getElementById("sortPages").value

  if(sort === "asc"){
    livros.sort((a,b)=>(a.volumeInfo.pageCount||0)-(b.volumeInfo.pageCount||0))
  }

  if(sort === "desc"){
    livros.sort((a,b)=>(b.volumeInfo.pageCount||0)-(a.volumeInfo.pageCount||0))
  }

  livros.forEach(livro=>{

    const info = livro.volumeInfo
    const paginas = info.pageCount || 0

    if(info.pageCount){
      totalPages += info.pageCount
    }

    const card = document.createElement("div")
    card.className = "card"

    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || ''}">
      <h4>${info.title}</h4>
      <p>${info.authors || 'Autor desconhecido'}</p>
      <p>${paginas > 0 ? paginas + " páginas" : "Páginas não informadas"}</p>
      <a href="${info.previewLink}" target="_blank">Abrir no Google Books</a>
      <br><br>
      <button onclick='salvarFavorito(${JSON.stringify(info)})'>⭐ Favorito</button>
    `

    container.appendChild(card)
  })

  document.getElementById("totalPages").innerText =
    `Total de páginas encontradas: ${totalPages}`

  document.getElementById("pageInfo").innerText =
    `Página ${currentPage + 1}`
}

// Paginação
function nextPage(){
  currentPage++
  carregarLivros()
}

function prevPage(){
  if(currentPage > 0){
    currentPage--
    carregarLivros()
  }
}

// Favoritos
function salvarFavorito(livro){

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || []

  if(!favoritos.some(f => f.title === livro.title)){
    favoritos.push(livro)
    localStorage.setItem("favoritos", JSON.stringify(favoritos))
  }

  mostrarFavoritos()
}

// Mostrar favoritos
function mostrarFavoritos(){

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || []

  const container = document.getElementById("favorites")
  container.innerHTML = ""

  favoritos.forEach(livro=>{

    const card = document.createElement("div")
    card.className = "card"

    card.innerHTML = `
      <img src="${livro.imageLinks?.thumbnail || ''}">
      <h4>${livro.title}</h4>
      <p>${livro.authors || 'Autor desconhecido'}</p>
    `

    container.appendChild(card)
  })
}

// Inicializar
mostrarFavoritos()
