<template>
    <div class="user-dtl">
        <p>Nom d'utilisateur: {{ userInfo.username }}</p>
        <p>Satut: {{ userInfo.user_status }}</p>
        <p>E-mail: {{ userInfo.email }}</p>
    </div>
</template>

<script>
export default {
    name: 'displayUser',
    props: {
        userInfo: {
            type: Object,
            default: null
        }
    }
};
</script>


<style scoped>
.user-dtl {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: black;
}
.user-dtl p {
  margin: 3px 0;
}
</style>