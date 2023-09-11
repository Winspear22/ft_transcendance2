<template>
    <div id="app">
      <div class="content-container">
        <DisplayPong />
        <nav>
          <router-link to="/" class="nav-link login-link">Login</router-link>
          <span class="separator">|</span>
          <router-link to="/setting" class="nav-link setting-link">Setting</router-link>
          <span class="separator">|</span>
          <router-link to="/home" class="nav-link home-link">Home</router-link>
          <span class="separator">|</span>
          <router-link to="/chat" class="nav-link chat-link">Chat</router-link>
          <span class="separator">|</span>
          <router-link to="/game" class="nav-link game-link">Game</router-link>
        </nav>
      </div>
      <router-view />
    </div>
  </template>
  
  <script>
  import DisplayPong from './displayPong'
  
  export default {
    components: {
      DisplayPong
    },
  };
  </script>  

<style>
.content-container {
  overflow: auto; /* Pour permettre le défilement si le contenu est trop long */
}
body {
  background: linear-gradient(to right, #2459d5 45%, #2fe8ee 80%);
}
nav {
  display: flex; /* transforme le conteneur en flex container */
  justify-content: center; /* centre les éléments enfants horizontalement */
  color: #2fe8ee;
}
nav a {
  cursor: pointer; /* change le curseur en main lors du survol */
  color: inherit; /* pour qu'il n'hérite pas la couleur bleue par défaut des liens */    text-decoration: none; /* pour supprimer le soulignement */
  margin: 0 5px; /* un peu d'espace entre les liens pour une meilleure apparence */
}
.game-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}
.login-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}
.setting-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}
.home-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}
.chat-link:hover {
  background-color: #1e4ba0; /* une couleur un peu plus foncée que #2459d5 pour l'exemple */
}
</style>%