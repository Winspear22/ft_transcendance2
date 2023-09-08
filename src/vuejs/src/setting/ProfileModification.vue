<template>
    <div class= "modification-container">
      <h1>M O D F I C A T I O N</h1>
      <changeEmail></changeEmail>
      <changeUsername></changeUsername>
      <ImageUploadComponent></ImageUploadComponent>
    </div>
</template>

<script>
import changeEmail from './changeEmail.vue';
import changeUsername from './changeUsername.vue';
import ImageUploadComponent from './ImageUploadComponent.vue';

export default {
  components: {
      ImageUploadComponent,
      changeEmail,
      changeUsername,
  },
}
</script>