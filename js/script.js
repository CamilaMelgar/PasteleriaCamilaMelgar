import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHZWx_Myqx67HgGEAT-ATVMbrnixmELNY",
    authDomain: "camilamelgarstore.firebaseapp.com",
    databaseURL: "https://camilamelgarstore-default-rtdb.firebaseio.com",
    projectId: "camilamelgarstore",
    storageBucket: "camilamelgarstore.appspot.com",
    messagingSenderId: "81079256237",
    appId: "1:81079256237:web:ae3d7ce5126e8790047224"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Get auth for user sign up and sign in
const auth = getAuth(app);
//Get firestore db 
const db = getFirestore(app);

let storeUser;

let carrito;

let cartIcon = document.querySelector('#cart-icon')
let cart = document.querySelector('.cart')
let closeCart = document.querySelector('#close-cart')

//Firebase sign up

const signUpForm = document.querySelector("#signup-form");
signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = signUpForm["signup-email"].value;
    const password = signUpForm["signup-password"].value;
    const name = signUpForm["signup-name"].value;

    // Authenticate the User
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            updateProfile(userCredential.user, {
                displayName: name
            })
            // clear the form
            signUpForm.reset();
            // close the modal
            $("#signUpModal").modal("hide");

            //Send email verification
            sendEmailVerification(auth.currentUser)
                .then(() => {
                    // Email verification sent!
                    Swal.fire({
                        titleText: 'Se ha enviado un mail de verificación a tu correo. Debes verificar tu cuenta para poder realizar compras.',
                        icon: 'success'
                    })
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage;

            switch (errorCode) {
                case "auth/weak-password":
                    errorMessage = "La contraseña debe tener al menos 6 letras."
                    break;
                case "auth/invalid-email":
                    errorMessage = "El email ingresado no es válido"
                    break;
                case "auth/email-already-in-use":
                    errorMessage = "Este email ya está siendo utilizado"
                    break;
                default:
                    errorMessage = "Ocurrió un error inesperado"
                    break;
            }

            Swal.fire({
                title: errorMessage,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
        });
});

//Firebase Login

const signInForm = document.querySelector("#signin-form");

signInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = signInForm["signin-email"].value;
    const password = signInForm["signin-password"].value;

    // Authenticate the User
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // clear the form
        signInForm.reset();
        // close the modal
        $("#signInModal").modal("hide");
    })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage;

            switch (errorCode) {
                case "auth/wrong-password":
                    errorMessage = "Contraseña incorrecta."
                    break;
                case "auth/invalid-email":
                    errorMessage = "El email ingresado no es válido"
                    break;
                case "auth/user-disabled":
                    errorMessage = "El usuario ha sido deshabilitado"
                    break;
                case "auth/user-not-found":
                    errorMessage = "El usuario no ha sido encontrado"
                    break;
                default:
                    errorMessage = "Ocurrió un error inesperado"
                    break;
            }

            Swal.fire({
                title: errorMessage,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
        });
});

const forgotPassword = document.querySelector("#forgot-password")
forgotPassword.addEventListener("click", (e) => {
    const email = signInForm["signin-email"].value;

    if (email.length === 0){
        Swal.fire({
            title: "Debes ingresar un mail",
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        });
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            // Password reset email sent!
            Swal.fire({
                titleText: 'Se ha enviado un mail a tu correo para que resetees tu contraseña.',
                icon: 'success'
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage;
            switch (errorCode) {
                case "auth/wrong-password":
                    errorMessage = "Contraseña incorrecta."
                    break;
                case "auth/invalid-email":
                    errorMessage = "El email ingresado no es válido"
                    break;
                case "auth/user-disabled":
                    errorMessage = "El usuario ha sido deshabilitado"
                    break;
                case "auth/user-not-found":
                    errorMessage = "El usuario no ha sido encontrado"
                    break;
                default:
                    errorMessage = "Ocurrió un error inesperado"
                    break;
            }

            Swal.fire({
                title: errorMessage,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            })
        });
});

//Firebase signOut

const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        console.log("signup out");
        storeUser = null;
    });
});

//Listener to when the user signs in or signs out with firebase.

auth.onAuthStateChanged((user) => {
    if (user) {
        userLoggedIn(user)
        storeUser = user;
        console.log("signin");
    } else {
        userLoggedOut()
        storeUser = null;
        console.log("signout");
    }
});

auth.onIdTokenChanged(function (user) {
    if (user) {
        // User is signed in or token was refreshed.
        console.log("Token changed")
        storeUser = user;
    }
});

class Product {
    constructor(name, image, price, quantity) {
        this.name = name;
        this.image = image;
        this.price = price;
        this.quantity = quantity;
    }
}

cartIcon.onclick = () => {
    cart.classList.add("active")
}

closeCart.onclick = () => {
    cart.classList.remove("active")
}

if (document.readyState == 'loading') {
    document.addEventListener("DOMContentLoaded", ready)
} else {
    ready()
}

function ready() {

    let removeCartButtons = document.getElementsByClassName('cart-remove');
    for (let i = 0; i < removeCartButtons.length; i++) {
        let button = removeCartButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    let quantityInputs = document.getElementsByClassName('cart-quantity');
    for (let i = 0; i < quantityInputs.length; i++) {
        let input = quantityInputs[i];
        input.addEventListener('click', quantityChanged)
    }

    let addCart = document.getElementsByClassName('add-cart');
    for (let i = 0; i < addCart.length; i++) {
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
    for (let i = 0; i < products.length; i++) {
        addProductToCart(products[i].name, products[i].price, products[i].image, products[i].quantity)
    }
    updateTotal()
}

function set_up_store_items(products) {

    let store_content = document.getElementsByClassName("shop-content")[0]

    for (let i = 0; i < products.length; i++) {

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

function buyButtonClicked(event) {

    if (auth.currentUser == null) {
        Swal.fire({
            title: "Debes iniciar sesión para realizar la compra. Si no tienes usuario puedes crear uno.",
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok'
        });

        return;
    } else {
        auth.currentUser.reload()
        if (auth.currentUser.emailVerified == false) {
            Swal.fire({
                title: "Debes verificar tu cuenta para poder realizar compras. Este proceso puede tomar unos segundos, por favor, intenta nuevamente.",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok'
            });
            return;
        }
    }


    let buttonClicked = event.target
    Swal.fire({
        titleText: 'Felicidades !',
        text: 'Tu compra fue realizada con éxito.',
        icon: 'success',
        footer: 'Gracias por elegirnos.'
    })

    let cartContent = document.getElementsByClassName("cart-content")[0]
    while (cartContent.hasChildNodes()) {
        cartContent.removeChild(cartContent.firstChild)
    }
    localStorage.clear()
    updateTotal()
}

function removeCartItem(event) {

    Swal.fire({
        title: 'Estás seguro que desas eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, quiero',
        cancelButtonText: 'No, no quiero'
    }).then((result) => {
        if (result.isConfirmed) {
            let buttonClicked = event.target;
            buttonClicked.parentElement.remove();
            updateTotal()
        }
    })
}

function quantityChanged(event) {
    let input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal()
}

function addCartClicked(event) {
    let button = event.target
    let shopProducts = button.parentElement;
    let title = shopProducts.getElementsByClassName("product-title")[0].innerText;
    let price = shopProducts.getElementsByClassName("price")[0].innerText;
    let productImg = shopProducts.getElementsByClassName("product-img")[0].src;
    addProductToCart(title, price, productImg, null)

    updateTotal()
}

function addProductToCart(title, price, productImg, quantity) {
    let cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    let cartItems = document.getElementsByClassName("cart-content")[0];
    let cartItemsNames = cartItems.getElementsByClassName("cart-product-title");
    for (let i = 0; i < cartItemsNames.length; i++) {
        if (cartItemsNames[i].innerText == title) {
            Swal.fire({
                titleText: 'Ya agregaste este producto al carrito',
                icon: 'warning'
            })
            return;
        }
    }

    let cartBoxContent = `
                            <img src="${productImg}" alt="" class="cart-img">
                            <div class="detail-box">
                                <div class="cart-product-title">${title}</div>
                                <div class="cart-price">${price}</div>
                                <input type="number" value="${quantity != null ? quantity : 1}" class="cart-quantity">
                            </div>
                            <i class="bx bxs-trash-alt cart-remove"></i>`;
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);
    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener('click', removeCartItem)
    cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener('click', quantityChanged)

    //This way I know the function is not called from the initial setup of the store.
    if (quantity == null) {
        Toastify({
            text: 'producto agregado al carrito',
            duration: 3000,
            gravity: 'bottom',
            position: 'center'
        }).showToast();
    }
}

function updateTotal() {
    let cartContent = document.getElementsByClassName("cart-content")[0];
    let cartBoxes = document.getElementsByClassName("cart-box");
    let badge = document.getElementsByClassName("icon-badge")[0];
    let total = 0;

    let totalQuantity = 0;
    carrito = [];

    for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];
        let img = cartBox.getElementsByClassName("cart-img")[0].src
        let name = cartBox.getElementsByClassName("cart-product-title")[0].innerHTML
        let priceElement = cartBox.getElementsByClassName("cart-price")[0];
        let quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
        let quantity = quantityElement.value;
        let price = parseFloat(priceElement.innerText.replace("$", ""));

        totalQuantity += parseInt(quantity)

        let product = new Product(name, img, price, quantity)
        carrito.push(product)

        total = total + price * quantity;
        total = Math.round(total * 100) / 100
    }

    let jsonProducts = JSON.stringify(carrito)
    localStorage.setItem("products", jsonProducts)
    localStorage.setItem("total", total)

    badge.innerHTML = totalQuantity.toString()
    document.getElementsByClassName("total-price")[0].innerText = "$" + total;
}

function userLoggedIn(user) {
    const welcome = document.querySelector("#welcome");
    const signin = document.querySelector("#signin-button");
    const signup = document.querySelector("#signup-button");
    const logout = document.querySelector("#logout");

    welcome.textContent = "Welcome " + user.displayName
    signin.style.display = 'none';
    logout.style.display = 'block';
    signup.style.display = 'none';
}

function userLoggedOut() {
    const welcome = document.querySelector("#welcome");
    const signin = document.querySelector("#signin-button");
    const signup = document.querySelector("#signup-button");
    const logout = document.querySelector("#logout");

    welcome.textContent = "Welcome"
    signin.style.display = 'block';
    logout.style.display = 'none';
    signup.style.display = 'block';
}