<template>
  <div id="app">
    <nav>
      <router-link to="/" class="login-link">Login</router-link> |
      <router-link to="/setting" class="setting-link">Setting</router-link> |
      <router-link to="/home" class="home-link">Home</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<style>
body {
  background: linear-gradient(to right, #2459d5 20%, #2fe8ee 80%);
  margin: 0; /* Pour s'assurer qu'il n'y a pas de marge autour du corps */
}

nav {
  display: flex; /* transforme le conteneur en flex container */
  justify-content: center; /* centre les éléments enfants horizontalement */
  padding: 10px 0; /* un peu d'espace en haut et en bas pour une meilleure apparence */
}

nav a {
  cursor: pointer; /* change le curseur en main lors du survol */
  color: inherit; /* pour qu'il n'hérite pas la couleur bleue par défaut des liens */
  text-decoration: none; /* pour supprimer le soulignement */
  margin: 0 5px; /* un peu d'espace entre les liens pour une meilleure apparence */

}

.router-link-active {
  background-color: inherit; /* réinitialise la couleur d'arrière-plan pour le lien actif */
}

.login-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}

.setting-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2fe8ee pour l'exemple */
}

.home-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}

nav a:visited {
  color: inherit; /* garde la couleur du texte telle quelle, même après avoir cliqué sur le lien */
}
</style>
