# Comma separated lists of skus to allow/restrict per region
AU_ALLOWED_SKUS = 'S020-35-0000,S020-62-0001,S020-63-0000,S020-64-0000,S020-65-0000,S020-66-0000,S020-67-0000,S020-68-0000,S020-69-0000,S020-70-0000,S020-71-0000,S020-72-0000,S020-76-0000,S025-03-3XL0,S025-03-LRG0,S025-03-MED0,S025-03-SML0,S025-03-XLG0,S025-03-XXL0,S025-04-3XL0,S025-04-LRG0,S025-04-MED0,S025-04-SML0,S025-04-XLG0,S025-04-XXL0,S025-05-3XL0,S025-05-LRG0,S025-05-MED0,S025-05-SML0,S025-05-XLG0,S025-05-XXL0,S025-06-0000,S025-08-LXL0,S025-08-MLG0,S025-08-SMM0,S025-09-0000,S025-10-3XL0,S025-10-LRG0,S025-10-MED0,S025-10-SML0,S025-10-XLG0,S025-10-XXL0,S025-11-3XL0,S025-11-LRG0,S025-11-MED0,S025-11-SML0,S025-11-XLG0,S025-11-XXL0,S045-12-0000,SF1018,SFPP0321,S020-90-0000,S020-81-0000,S020-31-0000,S088-01-0000'
GB_RESTRICTED_SKUS = 'S019-01-0000,S020-75-0000,S056-01-0000,S059-01-0000'
CA_RESTRICTED_SKUS = 'S017-01-0000,S030-26-0000,S030-28-0000,S053-01-0000,S059-01-0000'
US_RESTRICTED_SKUS = 'S056-01-0000'
FREE_GROUND_SHIPPING = false

if Input.cart && Input.cart.shipping_address
  disable_rates = false
  order_skus = Input.cart.line_items.map{ |line_item| line_item.variant.skus[0] }
  # puts('Order Skus', order_skus)
  if Input.cart.shipping_address.country_code == 'AU' || Input.cart.shipping_address.country_code == 'NZ' # 'AU', 'NZ'
    allowed_skus = AU_ALLOWED_SKUS.split(',').collect(&:strip)
    # puts('Allowed Skus', allowed_skus)
    disallowed_skus = order_skus - allowed_skus
    if disallowed_skus.count > 0
      # puts('Disallowed because not in allowed', disallowed_skus)
      disable_rates = true
    end
  end

  restricted_skus = []
  if Input.cart.shipping_address.country_code == 'GB' || Input.cart.shipping_address.country_code == 'FR' || Input.cart.shipping_address.country_code == 'DE' # 'GB', 'FR', 'DE'
    restricted_skus = GB_RESTRICTED_SKUS.split(',').collect(&:strip)
  end

  if Input.cart.shipping_address.country_code == 'CA' # 'CA'
    restricted_skus = CA_RESTRICTED_SKUS.split(',').collect(&:strip)
  end

  if Input.cart.shipping_address.country_code == 'US' # 'US'
    restricted_skus = US_RESTRICTED_SKUS.split(',').collect(&:strip)
  end

  if restricted_skus.count > 0
    # puts('Restricted Skus', restricted_skus)
    disallowed_skus = order_skus & restricted_skus
    if disallowed_skus.count > 0
      # puts('Disallowed because restricted', disallowed_skus)
      disable_rates = true
    end
  end

  if disable_rates
    Input.shipping_rates.delete_if{|rate| true}
  end

  if Input.cart.shipping_address.address1
    clean_address1 = Input.cart.shipping_address.address1.downcase()
    clean_address1 = clean_address1.gsub(' ', '')
    clean_address1 = clean_address1.gsub('.', '')
    clean_address1 = clean_address1.gsub('-', '')
    clean_address1 = clean_address1.gsub('_', '')
    if clean_address1.include?('pobox') or clean_address1.include?('postofficebox')
      Input.shipping_rates.delete_if{|rate| rate.name.include?('2nd Day') || rate.name.include?('Next Day')}
    end
  end
end


# Free shipping when subscription in cart
Input.cart.line_items.each do |line_item|
  if line_item.selling_plan_id
    FREE_GROUND_SHIPPING = true
  end
end

Input.shipping_rates.each do |shipping_rate|
  next unless shipping_rate.source == "shopify"
  if FREE_GROUND_SHIPPING
    if shipping_rate.name.include?('Standard') or shipping_rate.name == "Shipping"
      shipping_rate.apply_discount(shipping_rate.price, message: "")
    end
  end
end

Output.shipping_rates = Input.shipping_rates
