from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.products.models import Product

# Confirmed price mappings from reference recording and AURAPHOTOS analysis
AURA_PRICE_MAP = {
    # Watches
    'AURA-P003': Decimal('330.00'),  # Mint Charm Bracelet Watch (IMG-20260820-WA0009)
    'AURA-P004': Decimal('360.00'),  # Black Bead Bracelet Watch (IMG-20260820-WA0011)
    'AURA-P021': Decimal('650.00'),  # Ivory Crystal Bangle Watch Set
    'AURA-P022': Decimal('650.00'),  # Ruby Ribbed Bangle Watch Set (IMG-20260822-WA0002)
    'AURA-P023': Decimal('650.00'),  # Crimson Braided Bangle Watch Set (IMG-20260822-WA0003)
    'AURA-P024': Decimal('650.00'),  # Emerald Braided Bangle Watch Set (IMG-20260822-WA0004)
    'AURA-P025': Decimal('650.00'),  # Blush Braided Bangle Watch Set (IMG-20260822-WA0005)
    'AURA-P026': Decimal('750.00'),  # Midnight Deco Bangle Watch - Snake Style (IMG-20260822-WA0006)
    'AURA-P027': Decimal('750.00'),  # Ruby Deco Bangle Watch - Snake Style (IMG-20260822-WA0007)
    'AURA-P028': Decimal('400.00'),  # Emerald Deco Bangle Watch (IMG-20260822-WA0008)

    # Bangles
    'AURA-P005': Decimal('300.00'),  # Sculpted Gold-Tone Bangle Stack (IMG-20260820-WA0014)
    'AURA-P029': Decimal('200.00'),  # Textured Gold Bangle Stack (IMG-20260822-WA0009)

    # Oxidised Earrings (21 Aug)
    'AURA-P006': Decimal('150.00'),  # Ruby Teardrop Oxidised Earrings (IMG-20260821-WA0005)
    'AURA-P007': Decimal('150.00'),  # Emerald Teardrop Oxidised Earrings (IMG-20260821-WA0006)
    'AURA-P008': Decimal('150.00'),  # Onyx Teardrop Oxidised Earrings (IMG-20260821-WA0009)
    'AURA-P009': Decimal('140.00'),  # Classic Oxidised Jhumka Earrings (IMG-20260821-WA0010)
    'AURA-P010': Decimal('160.00'),  # Emerald Paisley Oxidised Earrings (IMG-20260821-WA0013)
    'AURA-P011': Decimal('160.00'),  # Blush Paisley Oxidised Earrings (IMG-20260821-WA0016)
    'AURA-P012': Decimal('160.00'),  # Ruby Paisley Oxidised Earrings (IMG-20260821-WA0017)
    'AURA-P013': Decimal('160.00'),  # Sky Blue Paisley Oxidised Earrings (IMG-20260821-WA0018)
    'AURA-P014': Decimal('150.00'),  # Emerald Elephant Oxidised Studs (IMG-20260821-WA0019)
    'AURA-P015': Decimal('150.00'),  # Onyx Elephant Oxidised Studs (IMG-20260821-WA0021)
    'AURA-P016': Decimal('150.00'),  # Ruby Elephant Oxidised Studs (IMG-20260821-WA0022)
    'AURA-P017': Decimal('150.00'),  # Blush Elephant Oxidised Studs (IMG-20260821-WA0023)
    'AURA-P018': Decimal('130.00'),  # Ruby Sunburst Oxidised Drops (IMG-20260821-WA0024)
    'AURA-P019': Decimal('130.00'),  # Emerald Sunburst Oxidised Drops (IMG-20260821-WA0026)
    'AURA-P020': Decimal('130.00'),  # Blush Sunburst Oxidised Drops (IMG-20260821-WA0027)

    # Jhumkas & Studs (23 Aug)
    'AURA-P030': Decimal('349.00'),  # Black Teardrop Jhumka Earrings (IMG-20260823-WA0000)
    'AURA-P031': Decimal('390.00'),  # Blush Peacock Jhumka Earrings (IMG-20260823-WA0002)
    'AURA-P032': Decimal('290.00'),  # Multicolour Temple Jhumka Earrings (IMG-20260823-WA0006)
    'AURA-P033': Decimal('160.00'),  # Petite Ruby Drop Earrings (IMG-20260823-WA0008)
    'AURA-P034': Decimal('260.00'),  # Ruby Floral Jhumka Earrings (IMG-20260823-WA0010)
    'AURA-P035': Decimal('210.00'),  # Emerald Filigree Jhumka Earrings (IMG-20260823-WA0012)
    'AURA-P036': Decimal('170.00'),  # Multicolour Peacock Jhumka Earrings (IMG-20260823-WA0014)
    'AURA-P037': Decimal('290.00'),  # Pearl Fringe Floral Jhumka Earrings (IMG-20260823-WA0016)
    'AURA-P038': Decimal('240.00'),  # Ruby Temple Jhumka Earrings (IMG-20260823-WA0018)
    'AURA-P039': Decimal('160.00'),  # Blush Kundan Jhumka Earrings (IMG-20260823-WA0020)
    'AURA-P040': Decimal('140.00'),  # Minimal Gold Stud Earrings (IMG-20260823-WA0022)
}


class Command(BaseCommand):
    help = 'Safely updates Aura product prices in the database without creating duplicates.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate updates without modifying the database.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        self.stdout.write(self.style.MIGRATE_HEADING(
            f"=== Aura Price Updater ({'DRY RUN' if dry_run else 'LIVE RUN'}) ==="
        ))

        total_existing = Product.objects.count()
        updated_count = 0
        already_correct_count = 0
        unmatched_count = 0

        self.stdout.write(f"Total existing Django products: {total_existing}\n")

        for product in Product.objects.all().order_by('sku'):
            sku = product.sku
            target_price = AURA_PRICE_MAP.get(sku)

            if target_price is not None:
                old_price = product.price
                if old_price == target_price:
                    already_correct_count += 1
                    self.stdout.write(f"  [OK]  {sku:10} | {product.name[:32]:32} | Rs. {target_price} (already correct)")
                else:
                    if not dry_run:
                        product.price = target_price
                        product.save(update_fields=['price'])
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f"  [UPD] {sku:10} | {product.name[:32]:32} | Rs. {old_price} -> Rs. {target_price}"
                    ))
            else:
                unmatched_count += 1
                self.stdout.write(f"  [--]  {sku:10} | {product.name[:32]:32} | Rs. {product.price} (kept safe)")

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS(
            f"SUMMARY:\n"
            f"  Existing products inspected:  {total_existing}\n"
            f"  Products with price updates:  {updated_count}\n"
            f"  Products already correct:     {already_correct_count}\n"
            f"  Products kept at base/Rs. 0:  {unmatched_count}\n"
            f"  Duplicates created:           0 (STRICTLY PREVENTED)\n"
            f"  Action mode:                  {'DRY RUN (No changes made)' if dry_run else 'COMMITTED TO DATABASE'}"
        ))
