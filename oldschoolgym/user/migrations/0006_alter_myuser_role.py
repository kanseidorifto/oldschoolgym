# Generated by Django 4.1.7 on 2023-04-03 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_alter_myuser_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='myuser',
            name='role',
            field=models.IntegerField(choices=[(0, 'Customer'), (1, 'Coach')], default=0),
        ),
    ]
