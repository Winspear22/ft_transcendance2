<template>
    <div class="profile-friend-container">
        <h2>{{ username }}</h2>
    </div>
</template>

<script>
export default {
    props: {
        username: {
            type: String,
            required: true
        }
    }
};
</script>