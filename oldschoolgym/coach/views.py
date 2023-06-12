from user.permissions import VerifiedCoachOnly, VerifiedUserOnly
from rest_framework.decorators import api_view, permission_classes
from .serializers import CoachSerializerToCreate, CoachSerializerToView, UserApplicationSerializer
from rest_framework.response import Response
from rest_framework import status
from user.utils import get_header_params, get_query_params
from drf_yasg.utils import swagger_auto_schema
from .models import Coach, UserApplication
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers


@swagger_auto_schema(method='get', responses={200: CoachSerializerToView(many=True)},
                     operation_description='To get all coaches. Returns list of coaches.')
# @cache_page(60*60)
@api_view(['GET'])
def get_confirmed_coaches(request):
    coaches = Coach.objects.select_related('user_profile').all()
    serialized_data = CoachSerializerToView(coaches, many=True)
    return Response(serialized_data.data, status=status.HTTP_200_OK)


@swagger_auto_schema(method='get', responses={200: CoachSerializerToView(many=True)},
                     operation_description='To get coach by id.',
                     manual_parameters=[get_query_params('coach_id', 'Coach id')])
# @cache_page(60*60)
@api_view(['GET'])
def get_coach_by_id(request):
    try:
        coach = Coach.objects.select_related('user_profile').get(pk=request.query_params.get('coach_id'))
    except Coach.DoesNotExist:
        return Response({'id': 'Coach doesnt exist!'}, status=status.HTTP_404_NOT_FOUND)
    serialized_data = CoachSerializerToView(coach)
    return Response(serialized_data.data, status=status.HTTP_200_OK)


@swagger_auto_schema(method='post', request_body=CoachSerializerToCreate, manual_parameters=[get_header_params()],
                     operation_description='To send application as coach.',
                     responses={200: CoachSerializerToView})
@api_view(['POST'])
@permission_classes([VerifiedCoachOnly])
def send_coach_application(request):
    if Coach.objects.filter(user_profile=request.user.id).exists():
        return Response({'user_id': 'You already have sent the application!'}, status=status.HTTP_409_CONFLICT)
    serialized_data = CoachSerializerToCreate(
        data=request.data)
    if serialized_data.is_valid():
        serialized_data.save(user_profile=request.user)
        return Response(serialized_data.data, status=status.HTTP_200_OK)
    return Response(serialized_data.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=UserApplicationSerializer, manual_parameters=[get_header_params()],
                     operation_description='To send application to coach as user.',
                     responses={200: UserApplicationSerializer})
@api_view(['POST'])
@permission_classes([VerifiedUserOnly])
def send_user_application(request):
    user_application = UserApplicationSerializer(data=request.data)
    if user_application.is_valid():
        if UserApplication.objects.filter(user_id=request.user.id).exists():
            return Response({'user_id': 'You can send only one application!'}, status=status.HTTP_409_CONFLICT)
        user_application.save(user=request.user)
        return Response(user_application.data, status=status.HTTP_200_OK)
    return Response(user_application.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='get', responses={200: UserApplicationSerializer(many=True)},
                     operation_description='To get all application from users.',
                     manual_parameters=[get_header_params()])
# @cache_page(60*15)
@vary_on_headers("Authorization")
@api_view(['GET'])
@permission_classes([VerifiedCoachOnly])
def get_my_application(request):
    my_applications = UserApplicationSerializer(
        Coach.objects.get(user_profile=request.user).user_applications.all(), many=True)
    return Response(my_applications.data, status=status.HTTP_200_OK)


@swagger_auto_schema(method='get', responses={200: UserApplicationSerializer(many=True)},
                     operation_description='To get user application',
                     manual_parameters=[get_header_params()])
@api_view(['GET'])
@permission_classes([VerifiedUserOnly])
def get_application_as_user(request):
    print(type(request.user))
    my_applications = UserApplicationSerializer(
        request.user.my_application)
    return Response(my_applications.data, status=status.HTTP_200_OK)
