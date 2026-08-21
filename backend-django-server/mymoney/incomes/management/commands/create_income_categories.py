from django.core.management.base import BaseCommand
from incomes.models import IncomeCategory


class Command(BaseCommand):
    help = 'Create default income categories'

    def handle(self, *args, **kwargs):
        categories = [
            ('salary', 'Salary income from employment'),
            ('freelance', 'Income from freelance work'),
            ('investment', 'Returns from investments'),
            ('business', 'Business income'),
            ('gift', 'Monetary gifts'),
            ('bonus', 'Bonuses and rewards'),
            ('other', 'Other income sources'),
        ]

        created_count = 0
        for name, description in categories:
            category, created = IncomeCategory.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created income category: {category.get_name_display()}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Income category already exists: {category.get_name_display()}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nTotal categories created: {created_count}')
        )
