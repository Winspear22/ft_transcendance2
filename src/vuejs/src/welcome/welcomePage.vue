<template>
    <div>
        <router-link to="/">P a r a m è t r e</router-link>
    </div>
</template>

<script>
export default {
  props: {
    userData: {
      type: Object,
      required: true
    }
  }
}
</script>