<template>
    <div>
        <img :src="profilePic" alt="Photo de profil" class="profile-picture"/>
    </div>
</template>

<script>
export default {
    name: 'profilePicture',
    props: {
        userPic: {
            type: String,
            default: null
        }
    },
    computed: {
        profilePic() {
            return this.userPic || require('@/assets/NicePng.png');
        }
    }
}
</script>

<style scoped>
.profile-picture {
    height: 100px;
}
</style>
