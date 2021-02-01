<template>
  <div class="base-input-number border-box w-auto ml15">
    <label class="base-input-number__label cl-primary flex h6 row m0" :for="getInputId">
      {{ name }}
      <span class="ml10">({{ max }} {{ $t(' available') }})</span>
    </label>
    <button
      class="mc-qty-button"
      @click="oneLess"
      :class="{'button-disabled': product.qty === 1 || loading }"
    >
      <span class="material-icons">remove</span>
    </button>
    <input
      :id="getInputId"
      :value="product.qty"
      :focus="autofocus"
      type="number"
      :min="min"
      :max="max"
      class="flex middle-lg middle-sm middle-xs quantity-input"
      @input="$emit('input', $event.target.value)"
      @blur="$emit('blur', $event.target.value)"
    >
    <button
      class="mc-qty-button"
      @click="oneMore"
      :class="{'button-disabled': loading || max <= product.qty}"
    >
      <span class="material-icons">add</span>
    </button>
    <ValidationMessages v-if="validations" :validations="validations" />
  </div>
</template>

<script>
import ValidationMessages from 'theme/components/core/blocks/Form/ValidationMessages.vue'

export default {
  name: 'BaseInput',
  components: {
    ValidationMessages
  },
  data () {
    return {
      loading: false,
      max: this.product.stock.qty,
      allProductInCart: this.$store.state.cart,
      productQty: this.product.qty
    }
  },
  props: {
    value: {
      type: [String, Number],
      default: 1
    },
    name: {
      type: String,
      required: false,
      default: ''
    },
    min: {
      type: Number,
      default: 0
    },
    autofocus: {
      type: Boolean,
      required: false,
      default: false
    },
    validations: {
      type: Array,
      default: () => []
    },
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    // Fix for saleable quantity
    onStockCheck (response) {
      if (response.sku === this.product.sku) {
        this.product.stock.qty = response.item.qty
        this.checProdQtyInCart()
      }
    },
    checProdQtyInCart () {
      var currentProdQty = this.product.qty
      var currentProdStockQty = this.product.stock.qty
      if (this.isInCart === true) {
        this.$store.state.cart.cartItems.find(p => {
          if (p.sku === this.product.sku) {
            var prodQtyInCart = p.qty
            var leftQty = currentProdStockQty - prodQtyInCart
            this.max = leftQty
            return this.max
          }
        })
      } else {
        this.max = this.maxProduct
      }
    },
    oneLess () {
      if (this.value <= 0) {
        this.product.qty = 0
      } else {
        this.product.qty = parseInt(this.value) - 1
        this.$emit('input', this.product.qty)
      }
    },
    oneMore () {
      this.product.qty = parseInt(this.value) + 1
      this.$emit('input', this.product.qty)
    }
  },
  computed: {
    getInputId () {
      return `input_${this._uid}`
    },
    isInCart () {
      return !!this.$store.state.cart.cartItems.find(p => p.sku === this.product.sku) || false
    },
    currentProduct () {
      return this.product.id
    },
    maxProduct () {
      return this.product.stock.qty
    }
  },
  watch: {
    currentProduct: {
      handler () {
        this.checProdQtyInCart()
      }
    },
    isInCart: {
      handler () {
        this.checProdQtyInCart()
      }
    }
  },
  mounted () {
    this.checProdQtyInCart()
    this.$bus.$on('stock-check', this.onStockCheck)
  },
  destroyed () {
    this.$bus.$off('stock-check', this.onStockCheck)
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.base-input-number {
  &__input {
    border-style: solid;
    border-width: 0 0 1px 0;
    width: 50px;
    height: 1.4rem;
    line-height: 1.7rem;
    @media (min-width: 768px) {
      height: 1.7rem;
    }
  }

  .base-input-number__label {
    color: #333333;
    font-weight: 600;
    line-height: 30px;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .mc-qty-button{
    float: left;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    height: 62px;
    width: 62px;
    border: 1px solid #E0E0E0;
    padding: 0;
    background: white;
    color: #333333;
    -webkit-transition: 0.5s;
    -o-transition: 0.5s;
    transition: 0.5s;

    .material-icons{
      opacity: 0.4;
    }
  }

  .quantity-input{
    width: 60px;
    height: 60px;
    font-size: 18px;
    float: left;
    margin: 0;
    text-align: center;
    font-weight: 300;
    padding: 0;
    outline: transparent;
    border: 1px solid #E0E0E0;
  }
}

</style>
<style lang="scss">
.base-input-number{
  .cl-error{
    float: left;
  }
}
</style>
