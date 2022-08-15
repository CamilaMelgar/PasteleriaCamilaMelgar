
let cartIcon = document.querySelector('#cart-icon')
let cart = document.querySelector('.cart')
let closeCart = document.querySelector('#close-cart')

class Product{
    constructor(name, image, price, quantity){
        this.name = name;
        this.image = image;
        this.price = price;
        this.quantity = quantity;
    }
}

cartIcon.onclick = () =>{
    cart.classList.add("active")
}

closeCart.onclick = () =>{
    cart.classList.remove("active")
}

if (document.readyState == 'loading'){
    document.addEventListener("DOMContentLoaded", ready)
}else{
    ready()
}

function ready(){

    let removeCartButtons = document.getElementsByClassName('cart-remove');
    for (let i = 0; i < removeCartButtons.length; i++){
        let button = removeCartButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    let quantityInputs = document.getElementsByClassName('cart-quantity');
    for (let i = 0; i < quantityInputs.length; i++){
        let input = quantityInputs[i];
        input.addEventListener('click', quantityChanged)
    }

    let addCart = document.getElementsByClassName('add-cart');
    for (let i = 0; i < addCart.length; i++){
        let button = addCart[i];
        button.addEventListener('click', addCartClicked);
    }

    fetch('jsons/products.json')
        .then((res) => res.json())
        .then((data) => {
            set_up_store_items(data) 
        })

    document.getElementsByClassName("btn-buy")[0].addEventListener("click", buyButtonClicked)

    let products = JSON.parse(localStorage.getItem("products")) || []
    for (let i = 0; i < products.length; i ++){
        addProductToCart(products[i].name, products[i].price, products[i].image, products[i].quantity)
    }
    updateTotal()
}

function set_up_store_items(products){

    let store_content = document.getElementsByClassName("shop-content")[0]

    for (let i = 0; i < products.length; i++){

        let store_item = document.createElement("div");
        store_item.classList.add("product-box");

        let store_item_content = `
            <img src="${products[i].image}" alt="${products[i].name}" class="product-img">
            <h2 class="product-title">${products[i].name}</h2>
            <span class="price">$${products[i].price}</span>
            <i class="bx bx-shopping-bag add-cart"></i>
        `
        store_item.innerHTML = store_item_content
        store_item.getElementsByClassName("add-cart")[0].addEventListener('click', addCartClicked)

        store_content.append(store_item)
    }

}

function buyButtonClicked(event){
    let buttonClicked =  event.target
    Swal.fire({
        titleText: 'Felicidades !',
        text: 'Tu compra fue realizada con éxito.',
        icon: 'success',
        footer: 'Gracias por elegirnos.'
    })

    let cartContent = document.getElementsByClassName("cart-content")[0]
    while(cartContent.hasChildNodes()){
        cartContent.removeChild(cartContent.firstChild)
    }
    localStorage.clear()
    updateTotal()
}

function removeCartItem(event){

    Swal.fire({
        title: 'Estás seguro que desas eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, quiero',
        cancelButtonText: 'No, no quiero'
    }).then((result) => {
        if (result.isConfirmed){
            let buttonClicked = event.target;
            buttonClicked.parentElement.remove();
            updateTotal()
        }
    })
}

function quantityChanged(event){
    let input = event.target
    if (isNaN(input.value) || input.value <= 0){
        input.value = 1;
    }
    updateTotal()
}

function addCartClicked(event){
    let button = event.target
    let shopProducts = button.parentElement;
    let title = shopProducts.getElementsByClassName("product-title")[0].innerText;
    let price = shopProducts.getElementsByClassName("price")[0].innerText;
    let productImg = shopProducts.getElementsByClassName("product-img")[0].src;
    addProductToCart(title, price, productImg, null)

    updateTotal()
}

function addProductToCart(title, price, productImg, quantity){
    let cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    let cartItems = document.getElementsByClassName("cart-content")[0];
    let cartItemsNames = cartItems.getElementsByClassName("cart-product-title");
    for (let i = 0; i < cartItemsNames.length; i++){
        if (cartItemsNames[i].innerText == title){
            Swal.fire({
                titleText: 'Ya agregaste este producto al carrito',
                icon : 'warning'
            })
            return;
        }
    }

    let cartBoxContent = `
                            <img src="${productImg}" alt="" class="cart-img">
                            <div class="detail-box">
                                <div class="cart-product-title">${title}</div>
                                <div class="cart-price">${price }</div>
                                <input type="number" value="${quantity != null ? quantity : 1}" class="cart-quantity">
                            </div>
                            <i class="bx bxs-trash-alt cart-remove"></i>`;
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);
    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener('click', removeCartItem)
    cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener('click', quantityChanged)

    //This way I know the function is not called from the initial setup of the store.
    if (quantity == null){
        Toastify({
            text: 'producto agregado al carrito',
            duration: 3000,
            gravity: 'bottom',
            position: 'center'
        }).showToast();
    }
}

function updateTotal(){
    let cartContent = document.getElementsByClassName("cart-content")[0];
    let cartBoxes = document.getElementsByClassName("cart-box");
    let badge = document.getElementsByClassName("icon-badge")[0];
    let total = 0;

    let products = [];
    let totalQuantity = 0;

    for (let i = 0; i < cartBoxes.length; i++){
        let cartBox = cartBoxes[i];
        let img = cartBox.getElementsByClassName("cart-img")[0].src
        let name = cartBox.getElementsByClassName("cart-product-title")[0].innerHTML
        let priceElement = cartBox.getElementsByClassName("cart-price")[0];
        let quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
        let quantity = quantityElement.value;
        let price = parseFloat(priceElement.innerText.replace("$", ""));

        totalQuantity += parseInt(quantity)

        let product = new Product(name, img, price, quantity)
        products.push(product)

        total = total + price * quantity;
        total = Math.round(total * 100) / 100
    }

    let jsonProducts = JSON.stringify(products)
    localStorage.setItem("products", jsonProducts)
    localStorage.setItem("total", total)

    badge.innerHTML = totalQuantity.toString()
    document.getElementsByClassName("total-price")[0].innerText = "$" + total; 
}